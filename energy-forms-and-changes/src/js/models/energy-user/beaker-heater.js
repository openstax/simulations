define(function (require) {

    'use strict';

    var _ = require('underscore');
    
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

        }),
        
        initialize: function(attributes, options) {
            EnergyUser.prototype.initialize.apply(this, [attributes, options]);
        },  

        update: function(time, deltaTime, incomingEnergy) {
            if (this.active()) {
                // Handle any incoming energy chunks
                this.handleIncomingEnergyChunks();

      
            }
        },

        handleIncomingEnergyChunks: function() {
            // var chunk;
            // for (var i = this.incomingEnergyChunks.length - 1; i >= 0; i--) {
            //     chunk = this.incomingEnergyChunks.models[i];
            //     if (chunk.get('energyType') === EnergyTypes.ELECTRICAL) {
            //         // Add the energy chunk to the list of those under management.
            //         this.energyChunks.add(chunk);
            //         this.incomingEnergyChunks.remove(chunk);

            //         // And a "mover" that will move this energy chunk through
            //         //   the wire to the bulb.
            //         this.electricalEnergyChunkMovers.push(new EnergyChunkPathMover(
            //             chunk,
            //             this.createElectricalEnergyChunkPath(this.get('position')),
            //             Constants.ENERGY_CHUNK_VELOCITY
            //         ));
            //     }
            //     else {
            //         // By design, this shouldn't happen, so warn if it does.
            //         console.error('LightBulb - Warning: Ignoring energy chunk with unexpected type, type = ' + chunk.get('energyType'));
            //     }
            // }
        },

        preloadEnergyChunks: function(incomingEnergyRate) {
            // this.clearEnergyChunks();
            // if (incomingEnergyRate.amount < Constants.MAX_ENERGY_PRODUCTION_RATE / 10 || incomingEnergyRate.type !== EnergyTypes.ELECTRICAL) {
            //     // No energy chunk pre-loading needed.
            //     return;
            // }

            // var deltaTime = 1 / Constants.FRAMES_PER_SECOND;
            // var energySinceLastChunk = Constants.ENERGY_PER_CHUNK * 0.99;

            // // Simulate energy chunks moving through the system
            // var preloadingComplete = false;
            // while (!preloadingComplete) {
            //     energySinceLastChunk += incomingEnergyRate.amount * deltaTime;

            //     // Determine if time to add a new chunk
            //     if (energySinceLastChunk >= Constants.ENERGY_PER_CHUNK) {
            //         var initialPosition = this._initialChunkPosition
            //             .set(this.get('position'))
            //             .add(LightBulb.OFFSET_TO_LEFT_SIDE_OF_WIRE);

            //         var newChunk = new EnergyChunk({
            //             energyType: EnergyTypes.ELECTRICAL,
            //             position: initialPosition
            //         });

            //         // Add a 'mover' for this energy chunk
            //         this.electricalEnergyChunkMovers.push(new EnergyChunkPathMover(
            //             newChunk,
            //             this.createElectricalEnergyChunkPath(this.get('position')),
            //             Constants.ENERGY_CHUNK_VELOCITY
            //         ));

            //         // Update energy since last chunk
            //         energySinceLastChunk -= Constants.ENERGY_PER_CHUNK;
            //     }

            //     this.moveElectricalEnergyChunks(deltaTime);
            //     this.moveFilamentEnergyChunks(deltaTime);

            //     if (this.radiatedEnergyChunkMovers.length > 1) {
            //         // A couple of chunks are radiating, which completes the pre-load.
            //         preloadingComplete = true;
            //     }
            // }
        },

        // createElectricalEnergyChunkPath: function(centerPosition) {
        //     return [
        //         centerPosition.clone().add(LightBulb.OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND),
        //         centerPosition.clone().add(LightBulb.OFFSET_TO_FIRST_WIRE_CURVE_POINT),
        //         centerPosition.clone().add(LightBulb.OFFSET_TO_SECOND_WIRE_CURVE_POINT),
        //         centerPosition.clone().add(LightBulb.OFFSET_TO_THIRD_WIRE_CURVE_POINT),
        //         centerPosition.clone().add(LightBulb.OFFSET_TO_BOTTOM_OF_CONNECTOR),
        //         centerPosition.clone().add(LightBulb.OFFSET_TO_RADIATE_POINT)
        //     ];
        // },

        // injectEnergyChunks: function(energyChunks) {
        //     this.incomingEnergyChunks.add(energyChunks);
        // },

        // clearEnergyChunks: function() {
        //     EnergyUser.prototype.clearEnergyChunks.apply(this);

        //     this.electricalEnergyChunkMovers = [];
        //     this.filamentEnergyChunkMovers = [];
        //     this.radiatedEnergyChunkMovers = [];
        // },

        // deactivate: function() {
        //     EnergyUser.prototype.deactivate.apply(this);
        //     this.set('litProportion', 0);
        // }

    }, Constants.LightBulb);

    return LightBulb;
});
