define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var EnergyChunk  = require('models/energy-chunk');
    var EnergySource = require('models/energy-source');
    var EnergyChunkCollection = require('models/energy-chunk-collection');
    var WaterDrop = require('models/water-drop');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var Faucet = EnergySource.extend({

        defaults: _.extend({}, EnergySource.prototype.defaults, {
            flowProportion: 0,
            waterPowerableElementInPlace: false
        }),
        
        initialize: function(attributes, options) {
            EnergySource.prototype.initialize.apply(this, [attributes, options]);

            this.exemptFromTransferEnergyChunks = new EnergyChunkCollection();
            this.waterDrops = new Backbone.Collection([], { model: WaterDrop });

            this.transferNextAvailableChunk = true;
            this.energySinceLastChunk = 0;

            this._initialChunkPosition = new Vector2();
            this._initialChunkVelocity = new Vector2();
            this._initialWaterDropPosition = new Vector2();
            this._waterCenterPosition = new Vector2();
        },

        preloadEnergyChunks: function(incomingEnergyRate) {
            this.clearEnergyChunks();
            var preloadTime = 3; // In seconds, empirically determined
            var deltaTime = 1 / Constants.FRAMES_PER_SECOND;
            var tempEnergyChunkList = [];

            // Simulate energy chunks moving through the system.
            var energyOutputRate = this.getEnergyOutputRate().amount;
            while (preloadTime > 0) {
                // Add energy chunks
                this.energySinceLastChunk += energyOutputRate * deltaTime;
                if (this.energySinceLastChunk >= Constants.ENERGY_PER_CHUNK) {
                    tempEnergyChunkList.push(this.createNewChunk());
                    this.energySinceLastChunk -= Constants.ENERGY_PER_CHUNK;
                }

                // Move the all the energy chunks we've collected so far
                for (var i = 0; i < tempEnergyChunkList.length; i++) {
                    // Make the chunk fall.
                    tempEnergyChunkList[i].translateBasedOnVelocity(deltaTime);
                }
                preloadTime -= deltaTime;
            }

            // Now that they are positioned, add these to the 'real' list of energy chunks.
            this.energyChunks.add(tempEnergyChunkList);
        },

        getEnergyOutputRate: function() {
            return {
                type: EnergyTypes.MECHANICAL,
                amount: Constants.MAX_ENERGY_PRODUCTION_RATE * this.get('flowProportion')
            };
        },

        deactivate: function() {
            EnergySource.prototype.deactivate.apply(this);
            this.waterDrops.reset();
            this.set('flowProportion', 0);
        },

        clearEnergyChunks: function() {
            EnergySource.prototype.clearEnergyChunks.apply(this);
            this.exemptFromTransferEnergyChunks.reset();
        },

        update: function(time, deltaTime) {
            if (this.active()) {
                // Add water droplets as needed based on flow rate.
                if (this.get('flowProportion') > 0) {
                    var initialWidth = this.get('flowProportion') * Faucet.MAX_WATER_WIDTH * (1 + (Math.random() - 0.5) * 0.2);
                    var initialPosition = this._initialWaterDropPosition.set(Faucet.OFFSET_FROM_CENTER_TO_WATER_ORIGIN).add(0, 0.01);
                    console.log(initialPosition);
                    this.waterDrops.add(new WaterDrop({
                        position: initialPosition,
                        width:    initialWidth,
                        height:   initialWidth
                    }));
                }

                // Make the water droplets fall.
                for (var i = 0; i < this.waterDrops.models.length; i++)
                    this.waterDrops.models[i].update(time, deltaTime);

                // Check if it's time to emit an energy chunk and, if so, do it.
                this.energySinceLastChunk += Constants.MAX_ENERGY_PRODUCTION_RATE * this.get('flowProportion') * deltaTime;
                if (this.energySinceLastChunk >= Constants.ENERGY_PER_CHUNK) {
                    this.energyChunks.add(this.createNewChunk());
                    this.energySinceLastChunk -= Constants.ENERGY_PER_CHUNK;
                }

                // Update energy chunk positions.
                this.updateEnergyChunks(time, deltaTime);
            }

            return {
                type: EnergyTypes.MECHANICAL,
                amount: Constants.MAX_ENERGY_PRODUCTION_RATE * this.get('flowProportion') * deltaTime,
                direction: -Math.PI / 2
            };
        },

        updateEnergyChunks: function(time, deltaTime) {
            var chunk;
            for (var i = this.energyChunks.length - 1; i >= 0; i--) {
                chunk = this.energyChunks.models[i];
                // Make the chunk fall.
                chunk.translateBasedOnVelocity(deltaTime);

                // See if chunk is in the location where it can be transferred
                //   to the next energy system.
                var waterCenter = this._waterCenterPosition.set(this.get('position')).add(Faucet.OFFSET_FROM_CENTER_TO_WATER_ORIGIN);
                var yOffset = waterCenter.y - chunk.get('position').y;
                if (this.get('waterPowerableElementInPlace') &&
                    Faucet.ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains(yOffset) &&
                    !this.exemptFromTransferEnergyChunks.get(chunk.cid)
                ) {
                    if (this.transferNextAvailableChunk) {
                        // Send this chunk to the next energy system.
                        this.outgoingEnergyChunks.add(chunk);

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

                // Remove it if it is out of visible range.
                if (waterCenter.distance(chunk.get('position')) > Faucet.MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER) {
                    this.energyChunks.remove(chunk);
                    this.exemptFromTransferEnergyChunks.remove(chunk);
                }
            }
        },

        createNewChunk: function() {
            var initialPosition = this._initialChunkPosition
                .set(this.get('position'))
                .add(Faucet.OFFSET_FROM_CENTER_TO_WATER_ORIGIN)
                .add((Math.random() - 0.5) * this.get('flowProportion') * Faucet.MAX_WATER_WIDTH / 2, 0);

            var initialVelocity = this._initialChunkVelocity.set(0, -Faucet.FALLING_ENERGY_CHUNK_VELOCITY);

            return new EnergyChunk({
                energyType: EnergyChunk.MECHANICAL, 
                position:   initialPosition,
                velocity:   initialVelocity
            });
        }

    }, Constants.Faucet);

    return Faucet;
});
