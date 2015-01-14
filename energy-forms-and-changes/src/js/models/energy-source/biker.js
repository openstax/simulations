define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var EnergyChunk  = require('models/energy-chunk');
    var EnergySource = require('models/energy-source');
    var EnergyChunkPathMover = require('models/energy-chunk-path-mover');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var Biker = EnergySource.extend({

        defaults: _.extend({}, EnergySource.prototype.defaults, {
            crankAngle: 0,
            rearWheelAngle: 0,
            bikerHasEnergy: true,
            targetCrankAngularVelocity: 0,
            mechanicalPoweredSystemIsNext: false
        }),
        
        initialize: function(attributes, options) {
            EnergySource.prototype.initialize.apply(this, [attributes, options]);

            // Keeping track of when to emit chunks
            this.energyProducedSinceLastChunkEmitted = Constants.ENERGY_PER_CHUNK * 0.9;
            this.mechanicalChunksSinceLastThermal = 0;

            // For moving energy chunks
            this.energyChunkMovers = [];

            // The actual angular velocity of the crank
            this.crankAngularVelocity = 0;

            // Start with some food in dat belly
            this.replenishEnergyChunks();

            // Add a handler for the situation when energy chunks were in transit
            //   to the next energy system and that system is swapped out.
            this.on('change:mechanicalPoweredSystemIsNext', this.mechanicalPoweredSystemIsNextChanged);
        },

        /**
         * This handles the situation where energy chunks are in transit when the
         *   next system changed. It removes problematic energy chunks or changes
         *   their type.
         */
        mechanicalPoweredSystemIsNextChanged: function(model, mechanicalPoweredSystemIsNext) {
            var hubPosition = this.offsetPosition(Biker.CENTER_OF_BACK_WHEEL_OFFSET);
            var chunk;
            for (var i = this.energyChunkMovers.length - 1; i >= 0; i--) {
                chunk = this.energyChunkMovers[i].energyChunk;
                if (chunk.get('energyType') === EnergyTypes.MECHANICAL) {
                    if (chunk.get('position').x > hubPosition.x) {
                        // Just remove this energy chunk
                        this.energyChunkMovers.splice(i, 1);
                        this.energyChunks.remove(chunk);
                    }
                    else {
                        // Make sure that this energy chunk turns to thermal energy.
                        this.energyChunkMovers.splice(i, 1);
                        this.energyChunkMovers.push(new EnergyChunkPathMover(
                            chunk,
                            this.createMechanicalToThermalEnergyChunkPath(this.get('position'), chunk.get('position')),
                            Constants.ENERGY_CHUNK_VELOCITY
                        ));
                    }
                }
            }
        },

        replenishEnergyChunks: function() {
            this.energyChunks.reset();
            var nominalInitialoffset = new Vector2(0.019, 0.05);
            var displacement = new Vector2();
            for (var i = 0; i < Biker.INITIAL_NUM_ENERGY_CHUNKS; i++) {
                displacement.set((Math.random() - 0.5) * 0.02, 0).rotate(Math.PI * 0.7);
                this.energyChunks.add(new EnergyChunk({
                    energyType: EnergyTypes.CHEMICAL, 
                    position:   this.offsetPosition(nominalInitialoffset).add(displacement)
                }));
            }
        },

        preloadEnergyChunks: function(incomingEnergyRate) {
            // For the biker, pre-loading of energy chunks isn't necessary, since
            //   they are being maintained even when visibility is turned off.
        },

        update: function(time, deltaTime) {
            if (this.active()) {
                // Update energy state
                this.set('bikerHasEnergy', this.bikerHasEnergy());

                this.updateVelocities(deltaTime);

                this.updateEnergyChunks(time, deltaTime);
            }

            return {
                type: EnergyTypes.MECHANICAL,
                amount: Math.abs(this.crankAngularVelocity / Biker.MAX_ANGULAR_VELOCITY_OF_CRANK * Biker.MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR * deltaTime),
                direction: -Math.PI / 2
            };
        },

        updateVelocities: function(deltaTime) {
            // If there is no energy, the target speed is 0, otherwise it is
            //   the current set point.
            var target = this.get('bikerHasEnergy') ? this.get('targetCrankAngularVelocity') : 0;

            // Speed up or slow down the angular velocity of the crank.
            var previousAngularVelocity = this.crankAngularVelocity;
            var angularVelocityDiffFromTarget = target - this.crankAngularVelocity;
            if (angularVelocityDiffFromTarget !== 0) {
                var change = Biker.ANGULAR_ACCELERATION * deltaTime;
                if (angularVelocityDiffFromTarget > 0) {
                    // Accelerate
                    this.crankAngularVelocity = Math.min(this.crankAngularVelocity + change, this.get('targetCrankAngularVelocity'));
                }
                else {
                    // Decelerate
                    this.crankAngularVelocity = Math.max(this.crankAngularVelocity - change, 0);
                }
            }
            this.set('crankAngle', (this.get('crankAngle') + this.crankAngularVelocity * deltaTime) % (2 * Math.PI));
            this.set('rearWheelAngle', (this.get('rearWheelAngle') + this.crankAngularVelocity * deltaTime * Biker.CRANK_TO_REAR_WHEEL_RATIO) % (2 * Math.PI));

            if (this.crankAngularVelocity === 0 && previousAngularVelocity !== 0) {
                // Set crank to a good position where animation will start
                // right away when motion is restarted.
                this.setCrankToPoisedPosition();
            }

            // Determine how much energy is produced in this time step.
            if (this.get('targetCrankAngularVelocity') > 0) {

                // Less energy is produced if not hooked up to generator.
                var maxEnergyProductionRate = this.get('mechanicalPoweredSystemIsNext') ? Biker.MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR : Biker.MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE;
                this.energyProducedSinceLastChunkEmitted += maxEnergyProductionRate * (this.crankAngularVelocity / Biker.MAX_ANGULAR_VELOCITY_OF_CRANK) * deltaTime;
            }
        },

        updateEnergyChunks: function(time, deltaTime) {
            // Decide if new chem energy chunk should start on its way.
            if (this.energyProducedSinceLastChunkEmitted >= Constants.ENERGY_PER_CHUNK && this.get('targetCrankAngularVelocity') > 0) {

                // Start a new chunk moving.
                if (this.bikerHasEnergy()) {
                    var energyChunk = this.findNonMovingEnergyChunk();
                    this.energyChunkMovers.push(new EnergyChunkPathMover(
                        energyChunk,
                        this.createChemicalEnergyChunkPath(this.get('position')),
                        Constants.ENERGY_CHUNK_VELOCITY
                    ));
                    this.energyProducedSinceLastChunkEmitted = 0;
                }
            }

            // Move the energy chunks
            var chunk;
            var energyChunkMover;
            for (var i = this.energyChunkMovers.length - 1; i >= 0; i--) {
                energyChunkMover = this.energyChunkMovers[i];
                energyChunkMover.moveAlongPath(deltaTime);
                chunk = energyChunkMover.energyChunk;
                if (energyChunkMover.finished()) {
                    if (chunk.get('energyType') === EnergyTypes.CHEMICAL) {
                        // Turn this into mechanical energy.
                        chunk.set('energyType', EnergyTypes.MECHANICAL);
                        this.energyChunkMovers.splice(i, 1);

                        // Add new mover for the mechanical energy chunk.
                        if (this.mechanicalChunksSinceLastThermal >= Biker.MECHANICAL_TO_THERMAL_CHUNK_RATIO || !this.get('mechanicalPoweredSystemIsNext')) {
                            // Make this chunk travel to the rear hub, where it
                            // will become a chunk of thermal energy.
                            this.energyChunkMovers.push(new EnergyChunkPathMover(
                                chunk,
                                this.createMechanicalToThermalEnergyChunkPath(this.get('position'), chunk.get('position')),
                                Constants.ENERGY_CHUNK_VELOCITY
                            ));
                            this.mechanicalChunksSinceLastThermal = 0;
                        }
                        else {
                            // Send this chunk to the next energy system.
                            this.energyChunkMovers.push(new EnergyChunkPathMover(
                                chunk,
                                this.createMechanicalEnergyChunkPath(this.get('position')),
                                Constants.ENERGY_CHUNK_VELOCITY
                            ));
                            this.mechanicalChunksSinceLastThermal++;
                        }
                    }
                    else if (chunk.get('energyType') === EnergyTypes.MECHANICAL && chunk.get('position').distance(this.offsetPosition(Biker.CENTER_OF_BACK_WHEEL_OFFSET)) < 1E-6) {
                        // This is a mechanical energy chunk that has traveled
                        //   to the hub and should now become thermal energy.
                        chunk.set('energyType', EnergyTypes.THERMAL);
                        this.energyChunkMovers.splice(i, 1);
                        this.energyChunkMovers.push(new EnergyChunkPathMover(
                            chunk,
                            this.createThermalEnergyChunkPath(this.get('position')),
                            Constants.ENERGY_CHUNK_VELOCITY
                        ));
                    }
                    else if (chunk.get('energyType') === EnergyTypes.THERMAL) {
                        // This is a radiating thermal energy chunk that has
                        //   reached the end of its route.  Delete it.
                        this.energyChunkMovers.splice(i, 1);
                        this.energyChunks.remove(chunk);
                    }
                    else {
                        // Must be mechanical energy that is being passed to
                        //   the next energy system.
                        this.outgoingEnergyChunks.add(chunk);
                        this.energyChunkMovers.splice(i, 1);
                    }
                }
            }
        },

        createChemicalEnergyChunkPath: function(centerPosition) {
            return [
                new Vector2(centerPosition).add(Biker.BIKER_BUTTOCKS_OFFSET),
                new Vector2(centerPosition).add(Biker.TOP_TUBE_ABOVE_CRANK_OFFSET)
            ];
        },

        createMechanicalEnergyChunkPath: function(centerPosition) {
            return [
                new Vector2(centerPosition).add(Biker.BIKE_CRANK_OFFSET),
                new Vector2(centerPosition).add(Biker.BOTTOM_OF_BACK_WHEEL_OFFSET),
                new Vector2(centerPosition).add(Biker.NEXT_ENERGY_SYSTEM_OFFSET)
            ];
        },

        createMechanicalToThermalEnergyChunkPath: function(centerPosition, currentPosition) {
            var path = [];

            var crankPosition = currentPosition.clone().add(Biker.BIKE_CRANK_OFFSET);
            if (currentPosition.y > crankPosition.y) {
                // Only add the crank position if the current position
                //   indicates that the chunk hasn't reached the crank 
                //   yet.
                path.push(new Vector2(centerPosition).add(Biker.BIKE_CRANK_OFFSET));
            }
            path.push(new Vector2(centerPosition).add(Biker.CENTER_OF_BACK_WHEEL_OFFSET));

            return path;
        },

        createThermalEnergyChunkPath: function(centerPosition) {
            var path = [];

            var segmentLength = 0.05;
            var maxAngle = Math.PI / 8;
            var numSegments = 3;

            var offset = centerPosition.clone().add(Biker.CENTER_OF_BACK_WHEEL_OFFSET);
            path.push(new Vector2(offset));

            // The chuck needs to move up and to the right to avoid overlapping with the biker.
            offset.add(new Vector2(segmentLength, 0).rotate(Math.PI * 0.4));

            // Add a set of path segments that make the chunk move up in a somewhat random path.
            path.push(new Vector2(offset));
            for (var i = 0; i < numSegments; i++) {
                offset.add(new Vector2(0, segmentLength).rotate((Math.random() - 0.5) * maxAngle));
                path.push(new Vector2(offset));
            }

            return path;
        },

        /**
         * Choose a non-moving energy chunk, returns null if all chunks are moving.
         */
        findNonMovingEnergyChunk: function() {
            for (var i = 0; i < this.energyChunks.length; i++) {
                // If we can't find the mover for this energy chunk, it's not moving.
                if (_.findWhere(this.energyChunkMovers, { energyChunk: this.energyChunks.models[i] }) === undefined)
                    return this.energyChunks.models[i];
            }
            return null;
        },

        /**
         * Set the crank to a position where a very small amount of motion will
         *   cause a new image to be chosen.  This is generally done when the 
         *   biker stops so that the animation starts right away the next time 
         *   the motion starts.
         */
        setCrankToPoisedPosition: function() {
            var currentImage = this.mapAngleToImageIndex(this.get('crankAngle'));
            var radiansPerImage = 2 * Math.PI / Biker.NUM_LEG_IMAGES;
            this.set('crankAngle', (currentImage % Biker.NUM_LEG_IMAGES * radiansPerImage + (radiansPerImage - 1E-7)));
        },

        mapAngleToImageIndex: function(angle) {
            var temp = Math.floor((angle % (2 * Math.PI)) / (Math.PI * 2 / Biker.NUM_LEG_IMAGES));
            if (temp >= Biker.NUM_LEG_IMAGES || temp < 0)
                throw 'Invalid image index!';
            return Math.floor((angle % (2 * Math.PI)) / (Math.PI * 2 / Biker.NUM_LEG_IMAGES));
        },

        bikerHasEnergy: function() {
            return this.energyChunks.length > 0 && this.energyChunks.length > this.energyChunkMovers.length;
        },

        deactivate: function() {
            EnergySource.prototype.deactivate.apply(this);
            this.set('targetCrankAngularVelocity', 0);
            this.crankAngularVelocity = this.get('targetCrankAngularVelocity');
        },

        activate: function() {
            EnergySource.prototype.activate.apply(this);
            // Note: The biker is replenished each time she is reactivated.  This
            //   was a fairly arbitrary decision, and can be changed if desired.
            this.replenishEnergyChunks();
        },

        clearEnergyChunks: function() {
            EnergySource.prototype.clearEnergyChunks.apply(this);
            this.energyChunkMovers = [];
        },

        getEnergyOutputRate: function() {
            return {
                type: EnergyTypes.MECHANICAL,
                amount: Math.abs(this.crankAngularVelocity / Biker.MAX_ANGULAR_VELOCITY_OF_CRANK * Biker.MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR)
            };
        },

    }, Constants.Biker);

    return Biker;
});
