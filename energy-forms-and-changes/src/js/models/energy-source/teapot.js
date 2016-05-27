define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var EnergySource = require('models/energy-source');
    var EnergyChunk  = require('models/energy-chunk');
    var EnergyChunkPathMover  = require('models/energy-chunk-path-mover');
    var EnergyChunkCollection = require('models/energy-chunk-collection');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var Teapot = EnergySource.extend({

        defaults: _.extend({}, EnergySource.prototype.defaults, {
            heatCoolLevel: 0,
            energyProductionRate: 0,
            steamPowerableElementInPlace: false
        }),
        
        initialize: function(attributes, options) {
            EnergySource.prototype.initialize.apply(this, [attributes, options]);

            // Energy chunks that escape into the air instead of transfering to the wheel
            this.exemptFromTransferEnergyChunks = new EnergyChunkCollection();

            // Keeping track of when to emit chunks
            this.transferNextAvailableChunk = true;
            this.heatEnergyProducedSinceLastChunk = Constants.ENERGY_PER_CHUNK / 2;

            // For moving energy chunks
            this.energyChunkMovers = [];

            // Cached objects
            this._initialChunkPosition = new Vector2();
            this._initialChunkVelocity = new Vector2();
            this._spoutPosition = new Vector2();
        },

        preloadEnergyChunks: function() {
            this.clearEnergyChunks();
            if (this.get('energyProductionRate') === 0) {
                // No chunks to add.
                return;
            }

            var deltaTime = 1 / Constants.FRAMES_PER_SECOND;
            var energySinceLastChunk = Constants.ENERGY_PER_CHUNK * 0.99;

            var spoutPosition = this._spoutPosition.set(this.get('position')).add(Teapot.SPOUT_BOTTOM_OFFSET);

            // Simulate energy chunks moving through the system
            var preloadingComplete = false;
            while (!preloadingComplete) {
                energySinceLastChunk += this.get('energyProductionRate') * deltaTime;

                // Determine if time to add a new chunk
                if (energySinceLastChunk >= Constants.ENERGY_PER_CHUNK) {
                    var initialPosition = this._initialChunkPosition.set(
                        this.get('position').x,
                        this.get('position').y + Teapot.WATER_SURFACE_HEIGHT_OFFSET
                    );

                    // Create and add a new chunk
                    var newChunk = EnergyChunk.create({
                        energyType: Math.random() > Teapot.MECHANICAL_ENERGY_CHUNK_RATE ? EnergyTypes.MECHANICAL : EnergyTypes.THERMAL,
                        position: initialPosition
                    });
                    this.energyChunks.add(newChunk);
                    
                    // Create a 'mover' for the chunk
                    var travelDistance = newChunk.get('position').distance(spoutPosition);
                    this.energyChunkMovers.push(new EnergyChunkPathMover(
                        newChunk,
                        this.createPathToSpoutBottom(this.get('position')),
                        travelDistance / Teapot.ENERGY_CHUNK_WATER_TO_SPOUT_TIME
                    ));

                    // Update energy since last chunk
                    energySinceLastChunk -= Constants.ENERGY_PER_CHUNK;
                }

                this.updateEnergyChunks(deltaTime);

                if (this.outgoingEnergyChunks.length > 0) {
                    // An energy chunk has made it all the way through the system
                    preloadingComplete = true;
                }
            }
        },

        update: function(time, deltaTime) {
            if (this.active()) {
                // Update energy production rate based on heatCoolLevel
                this.updateEnergyProductionRate(deltaTime);

                // See if it's time to emit a new energy chunk from the heater.
                this.heatEnergyProducedSinceLastChunk += Math.max(this.get('heatCoolLevel'), 0) * Constants.MAX_ENERGY_PRODUCTION_RATE * deltaTime;
                if (this.heatEnergyProducedSinceLastChunk >= Constants.ENERGY_PER_CHUNK)
                    this.emitEnergyChunkFromHeater(deltaTime);

                // Move all energy chunks that are under this element's control.
                this.updateEnergyChunks(deltaTime);
            }

            return {
                type: EnergyTypes.MECHANICAL,
                amount: this.get('energyProductionRate') * deltaTime,
                direction: Math.PI / 2
            };
        },

        updateEnergyProductionRate: function(deltaTime) {
            if (this.get('heatCoolLevel') || this.get('energyProductionRate') > Teapot.COOL_DOWN_COMPLETE_THRESHOLD) {
                // Calculate the energy production rate.
                var energyProductionIncreaseRate = this.get('heatCoolLevel') * Teapot.MAX_ENERGY_CHANGE_RATE; // Analogous to acceleration.
                var energyProductionDecreaseRate = this.get('energyProductionRate') * Teapot.COOLING_CONSTANT; // Analogous to friction.
                this.set('energyProductionRate', Math.min(
                    this.get('energyProductionRate') + energyProductionIncreaseRate * deltaTime - energyProductionDecreaseRate * deltaTime,
                    Constants.MAX_ENERGY_PRODUCTION_RATE 
                )); // Analogous to velocity.
           }
           else {
               // Clamp the energy production rate to zero so that it doesn't
               //   trickle on forever.
               this.set('energyProductionRate', 0);
           }
        },

        emitEnergyChunkFromHeater: function(deltaTime) {
            var initialPosition = this._initialChunkPosition.set(
                this.get('position').x + Teapot.THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE.random(),
                this.get('position').y + Teapot.THERMAL_ENERGY_CHUNK_Y_ORIGIN
            );

            var chunk = EnergyChunk.create({
                energyType: EnergyChunk.THERMAL, 
                position:   initialPosition
            });

            this.energyChunks.add(chunk);
            this.energyChunkMovers.push(new EnergyChunkPathMover(
                chunk,
                this.createThermalEnergyChunkPath(initialPosition, this.get('position')),
                Constants.ENERGY_CHUNK_VELOCITY
            ));

            this.heatEnergyProducedSinceLastChunk -= Constants.ENERGY_PER_CHUNK;
        },

        updateEnergyChunks: function(deltaTime) {
            var chunk;
            var energyChunkMover;
            for (var i = this.energyChunkMovers.length - 1; i >= 0; i--) {
                energyChunkMover = this.energyChunkMovers[i];
                energyChunkMover.moveAlongPath(deltaTime);
                chunk = energyChunkMover.energyChunk;
                if (energyChunkMover.finished()) {
                    // Remove the mover because it's done
                    this.energyChunkMovers.splice(i, 1);

                    // We might need this later
                    var spoutPosition = this._spoutPosition.set(this.get('position')).add(Teapot.SPOUT_BOTTOM_OFFSET);

                    // I'm not sure why they are comparing float values like this, and it makes me suspicious, but I'll do it like them for now and see if it causes errors
                    if (chunk.get('energyType') === EnergyTypes.THERMAL && chunk.get('position').y === this.get('position').y + Teapot.WATER_SURFACE_HEIGHT_OFFSET) {
                        // This is a thermal chunk that is coming out of the water.
                        if (Math.random() > Teapot.MECHANICAL_ENERGY_CHUNK_RATE) {
                            // Turn the chunk into mechanical energy.
                            chunk.set('energyType', EnergyTypes.MECHANICAL);
                        }
                        // Set this chunk on a path to the base of the spout.
                        
                        var travelDistance = chunk.get('position').distance(spoutPosition);
                        this.energyChunkMovers.push(new EnergyChunkPathMover(
                            chunk,
                            this.createPathToSpoutBottom(this.get('position')),
                            travelDistance / Teapot.ENERGY_CHUNK_WATER_TO_SPOUT_TIME
                        ));
                    }
                    else if (chunk.get('position').equals(spoutPosition)) {
                        // The chunk is moving out of the spout.
                        this.energyChunkMovers.push(new EnergyChunkPathMover(
                            chunk,
                            this.createSpoutExitPath(this.get('position')),
                            Constants.ENERGY_CHUNK_VELOCITY
                        ));
                    }
                    else {
                        // This chunk is out of view, and we are done with it.
                        this.energyChunks.remove(chunk);
                        chunk.destroy();
                    }
                }
                else {
                    // See if this energy chunks should be transferred to the
                    //   next energy system.
                    if (chunk.get('energyType') === EnergyTypes.MECHANICAL &&
                        this.get('steamPowerableElementInPlace') &&
                        Teapot.ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains(this.get('position').distance(chunk.get('position'))) &&
                        !this.exemptFromTransferEnergyChunks.get(chunk)
                    ) {
                        if (this.transferNextAvailableChunk) {
                            // Send this chunk to the next energy system.
                            this.outgoingEnergyChunks.add(chunk);
                            this.energyChunkMovers.splice(i, 1);

                            // Alternate sending or keeping chunks.
                            this.transferNextAvailableChunk = false;
                        }
                        else {
                            // Don't transfer this chunk.
                            this.exemptFromTransferEnergyChunks.add(chunk);

                            // Set up to transfer the next one.
                            this.transferNextAvailableChunk = true;
                        }
                    }
                }
            }
        },

        createThermalEnergyChunkPath: function(startPosition, teapotPosition) {
            return [
                new Vector2(startPosition.x, teapotPosition.y + Teapot.WATER_SURFACE_HEIGHT_OFFSET)
            ];
        },

        createPathToSpoutBottom: function(parentElementPosition) {
            return [
                new Vector2(parentElementPosition).add(Teapot.SPOUT_BOTTOM_OFFSET)
            ];
        },

        createSpoutExitPath: function(parentElementPosition) {
            return [
                new Vector2(parentElementPosition).add(Teapot.SPOUT_TIP_OFFSET),
                new Vector2(parentElementPosition).add(Teapot.DISTANT_TARGET_OFFSET)
            ];
        },

        deactivate: function() {
            EnergySource.prototype.deactivate.apply(this);
            this.set('heatCoolLevel', 0);
            this.set('energyProductionRate', 0);
        },

        clearEnergyChunks: function() {
            EnergySource.prototype.clearEnergyChunks.apply(this);
            this.exemptFromTransferEnergyChunks.reset();
            this.energyChunkMovers = [];
        },

        getEnergyOutputRate: function() {
            return {
                type: EnergyTypes.MECHANICAL,
                amount: this.get('energyProductionRate')
            };
        },

    }, Constants.Teapot);

    return Teapot;
});
