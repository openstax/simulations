define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var EnergyUser            = require('models/energy-user');
    var EnergyChunkPathMover  = require('models/energy-chunk-path-mover');
    var EnergyChunk           = require('models/energy-chunk');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var LightBulb = EnergyUser.extend({

        defaults: _.extend({}, EnergyUser.prototype.defaults, {
            litProportion: 0,
            hasFilament: false,
            proportionOfThermalChunksRadiated: 0,

            // This is the only class that really needs this info, and really it should be designed
            //   to not need it, but for the sake of sticking with the original algorithms and not
            //   introducing new bugs, we're going to keep it. 
            energyChunksVisible: false 
        }),
        
        initialize: function(attributes, options) {
            EnergyUser.prototype.initialize.apply(this, [attributes, options]);

            this.electricalEnergyChunkMovers = [];
            this.filamentEnergyChunkMovers = [];
            this.radiatedEnergyChunkMovers = [];

            // Fewer thermal energy chunks are radiated for bulbs without a filament.
            this.set('proportionOfThermalChunksRadiated', this.get('hasFilament') ? 0.35 : 0.2);

            this._radiatePoint = new Vector2();
        },  

        update: function(time, deltaTime, incomingEnergy) {
            if (this.active()) {
                // Handle any incoming energy chunks
                this.handleIncomingEnergyChunks();

                // Move all of the energy chunks
                this.moveElectricalEnergyChunks(deltaTime);
                this.moveFilamentEnergyChunks(deltaTime);
                this.moveRadiatedEnergyChunks(deltaTime);

                // Set how lit the bulb is
                this.updateLitProportion(deltaTime, incomingEnergy);
            }
        },

        moveRadiatedEnergyChunks: function(deltaTime) {
            for (var i = this.radiatedEnergyChunkMovers.length - 1; i >= 0; i--) {
                this.radiatedEnergyChunkMovers[i].moveAlongPath(deltaTime);
                if (this.radiatedEnergyChunkMovers[i].finished()) {
                    // Remove the chunk and its mover
                    this.energyChunks.remove(this.radiatedEnergyChunkMovers[i].energyChunk);
                    this.radiatedEnergyChunkMovers.splice(i, 1);
                }
            }
        },

        moveFilamentEnergyChunks: function(deltaTime) {
            for (var i = this.filamentEnergyChunkMovers.length - 1; i >= 0; i--) {
                this.filamentEnergyChunkMovers[i].moveAlongPath(deltaTime);
                if (this.filamentEnergyChunkMovers[i].finished()) {
                    // Remove the chunk and its mover
                    this.filamentEnergyChunkMovers.splice(i, 1);
                    this.radiateEnergyChunk(this.filamentEnergyChunkMovers[i].energyChunk);
                }
            }
        },

        moveElectricalEnergyChunks: function(deltaTime) {
            var mover;
            for (var i = this.electricalEnergyChunkMovers.length - 1; i >= 0; i--) {
                mover = this.electricalEnergyChunkMovers[i];
                mover.moveAlongPath(deltaTime);
                if (mover.finished()) {
                    this.electricalEnergyChunkMovers.splice(i, 1);
                    // Remove the chunk and its mover
                    if (this.get('hasFilament')) {
                        // Turn this energy chunk into thermal energy on the filament.
                        mover.energyChunk.set('energyType', EnergyTypes.THERMAL);
                        var path = this.createThermalEnergyChunkPath(mover.energyChunk.get('position'));
                        this.filamentEnergyChunkMovers.add(new EnergyChunkPathMover(
                            mover.energyChunk,
                            path,
                            this.getTotalPathLength(mover.energyChunk.get('position'), path) / this.generateThermalChunkTimeOnFilament()
                        ));
                    }
                    else {
                        // There is no filament, so just radiate the chunk.
                        this.radiateEnergyChunk(mover.energyChunk);
                    }
                }
            }
        },

        handleIncomingEnergyChunks: function() {
            var chunk;
            for (var i = this.incomingEnergyChunks.length - 1; i >= 0; i--) {
                chunk = this.incomingEnergyChunks.models[i];
                if (chunk.get('energyType') === EnergyTypes.ELECTRICAL) {
                    // Add the energy chunk to the list of those under management.
                    this.energyChunks.add(chunk);
                    this.incomingEnergyChunks.remove(chunk);

                    // And a "mover" that will move this energy chunk through
                    //   the wire to the bulb.
                    this.electricalEnergyChunkMovers.push(new EnergyChunkPathMover(
                        chunk,
                        this.createElectricalEnergyChunkPath(this.get('position')),
                        Constants.ENERGY_CHUNK_VELOCITY
                    ));
                }
                else {
                    // By design, this shouldn't happen, so warn if it does.
                    console.error('LightBulb - Warning: Ignoring energy chunk with unexpected type, type = ' + chunk.get('energyType'));
                }
            }
        },

        updateLitProportion: function(deltaTime, incomingEnergy) {
            if (this.get('energyChunksVisible')) {
                // Energy chunks are visible, so the lit proportion is
                //   dependent upon whether light energy chunks are present.
                var lightChunksInLitRadius = 0;
                var lightEnergyChunkMover;
                for (var i = 0; i < this.radiatedEnergyChunkMovers.length; i++) {
                    lightEnergyChunkMover = this.radiatedEnergyChunkMovers[i];
                    var radiatePoint = this._radiatePoint
                        .set(this.get('position'))
                        .add(LightBulb.OFFSET_TO_RADIATE_POINT);

                    if (lightEnergyChunkMover.energyChunk.get('position').distance(radiatePoint) < LightBulb.LIGHT_CHUNK_LIT_BULB_RADIUS)
                        lightChunksInLitRadius++;
                }

                if (lightChunksInLitRadius > 0) {
                    // Light is on.
                    this.set('litProportion', Math.min(1, this.get('litProportion') + LightBulb.LIGHT_CHANGE_RATE * deltaTime));
                }
                else {
                    // Light is off.
                    this.set('litProportion', Math.max(0, this.get('litProportion') - LightBulb.LIGHT_CHANGE_RATE * deltaTime));
                }
            }
            else {
                if (this.active() && incomingEnergy.type === EnergyTypes.ELECTRICAL) {
                    var litProportion = incomingEnergy.amount / (LightBulb.ENERGY_TO_FULLY_LIGHT * deltaTime);
                    this.set('litProportion', Math.min(1, Math.max(0, this.wheelRotationalVelocity)));
                }
                else {
                    this.set('litProportion', 0);
                }
            }
        },

        preloadEnergyChunks: function(incomingEnergyRate) {
            this.clearEnergyChunks();
            if (incomingEnergyRate.amount < Constants.MAX_ENERGY_PRODUCTION_RATE / 10 || incomingEnergyRate.type !== EnergyTypes.ELECTRICAL) {
                // No energy chunk pre-loading needed.
                return;
            }

            var deltaTime = 1 / Constants.FRAMES_PER_SECOND;
            var energySinceLastChunk = Constants.ENERGY_PER_CHUNK * 0.99;

            // Simulate energy chunks moving through the system
            var preloadingComplete = false;
            while (!preloadingComplete) {
                energySinceLastChunk += incomingEnergyRate.amount * deltaTime;

                // Determine if time to add a new chunk
                if (energySinceLastChunk >= Constants.ENERGY_PER_CHUNK) {
                    var initialPosition = this._initialChunkPosition
                        .set(this.get('position'))
                        .add(LightBulb.OFFSET_TO_LEFT_SIDE_OF_WIRE);

                    var newChunk = new EnergyChunk({
                        energyType: EnergyTypes.ELECTRICAL,
                        position: initialPosition
                    });

                    // Add a 'mover' for this energy chunk
                    this.electricalEnergyChunkMovers.push(new EnergyChunkPathMover(
                        newChunk,
                        this.createElectricalEnergyChunkPath(this.get('position')),
                        Constants.ENERGY_CHUNK_VELOCITY
                    ));

                    // Update energy since last chunk
                    energySinceLastChunk -= Constants.ENERGY_PER_CHUNK;
                }

                this.moveElectricalEnergyChunks(deltaTime);
                this.moveFilamentEnergyChunks(deltaTime);

                if (this.radiatedEnergyChunkMovers.length > 1) {
                    // A couple of chunks are radiating, which completes the pre-load.
                    preloadingComplete = true;
                }
            }
        },

        radiateEnergyChunk: function(chunk) {
            if (Math.random() > this.get('proportionOfThermalChunksRadiated'))
                chunk.set('energyType', EnergyTypes.LIGHT);
            else
                chunk.set('energyType', EnergyTypes.THERMAL);

            var rotation = (Math.random() - 0.5) * (Math.PI / 2);
            var lightPath = [
                this.get('position')
                    .clone()
                    .add(LightBulb.OFFSET_TO_RADIATE_POINT)
                    .add(
                        new Vector2(0, LightBulb.RADIATED_ENERGY_CHUNK_MAX_DISTANCE).rotate(rotation)
                    )
            ];

            this.radiatedEnergyChunkMovers.push(new EnergyChunkPathMover(
                chunk,
                lightPath,
                Constants.ENERGY_CHUNK_VELOCITY
            ));
        },

        createThermalEnergyChunkPath: function(startingPoint) {
            this.goRightNextTime = !this.goRightNextTime;
            var xTranslation = (0.5 + Math.random() / 2) * LightBulb.FILAMENT_WIDTH / 2 * (this.goRightNextTime ? 1 : -1);
            return [
                startingPoint.clone().add(xTranslation, 0)
            ];
        },

        createElectricalEnergyChunkPath: function(centerPosition) {
            return [
                centerPosition.clone().add(LightBulb.OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND),
                centerPosition.clone().add(LightBulb.OFFSET_TO_FIRST_WIRE_CURVE_POINT),
                centerPosition.clone().add(LightBulb.OFFSET_TO_SECOND_WIRE_CURVE_POINT),
                centerPosition.clone().add(LightBulb.OFFSET_TO_THIRD_WIRE_CURVE_POINT),
                centerPosition.clone().add(LightBulb.OFFSET_TO_BOTTOM_OF_CONNECTOR),
                centerPosition.clone().add(LightBulb.OFFSET_TO_RADIATE_POINT)
            ];
        },

        generateThermalChunkTimeOnFilament: function() {
            return LightBulb.THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.random();
        },

        getTotalPathLength: function(startingLocation, pathPoints) {
            if (pathPoints.length === 0)
                return 0;

            pathLength = startingLocation.distance(pathPoints[0]);
            for (var i = 0; i < pathPoints.length - 1; i++)
                pathLength += pathPoints[i].distance(pathPoints[i + 1]);

            return pathLength;
        },

        injectEnergyChunks: function(energyChunks) {
            this.incomingEnergyChunks.add(energyChunks);
        },

        clearEnergyChunks: function() {
            EnergyUser.prototype.clearEnergyChunks.apply(this);

            this.electricalEnergyChunkMovers = [];
            this.filamentEnergyChunkMovers = [];
            this.radiatedEnergyChunkMovers = [];
        },

        deactivate: function() {
            EnergyUser.prototype.deactivate.apply(this);
            this.set('litProportion', 0);
        }

    }, Constants.LightBulb);

    return LightBulb;
});
