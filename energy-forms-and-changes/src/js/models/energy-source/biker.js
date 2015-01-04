define(function (require) {

    'use strict';

    var _ = require('underscore');

    // var EnergyChunk  = require('models/energy-chunk');
    var EnergySource = require('models/energy-source');
    // var EnergyChunkCollection = require('models/energy-chunk-collection');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var Biker = EnergySource.extend({

        defaults: _.extend({}, EnergySource.prototype.defaults, {
 
        }),
        
        initialize: function(attributes, options) {
            EnergySource.prototype.initialize.apply(this, [attributes, options]);

            this.transferNextAvailableChunk = true;
            this.energySinceLastChunk = 0;
        },

        preloadEnergyChunks: function(incomingEnergyRate) {

        },

        getEnergyOutputRate: function() {
            return {
                type: EnergyTypes.MECHANICAL,
                amount: Constants.MAX_ENERGY_PRODUCTION_RATE
            };
        },

        update: function(time, deltaTime) {
            return{type: 2, amount: 133, direction: -1.5}; // just for testing
        },

        updateEnergyChunks: function(time, deltaTime) {

        },

        createNewChunk: function() {

        }

    });

    return Biker;
});
