define(function (require) {

    'use strict';

    var EnergySystemElement   = require('models/energy-system-element');
    var EnergyChunkCollection = require('models/energy-chunk-collection');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var EnergySource = EnergySystemElement.extend({
        
        initialize: function(attributes, options) {
            EnergySystemElement.prototype.initialize.apply(this, [attributes, options]);

            this.outgoingEnergyChunks = new EnergyChunkCollection();
        },

        preloadEnergyChunks: function(incomingEnergyRate) {},

        getEnergyOutputRate: function() {},

        extractOutgingEnergyChunks: function() {
            var models = this.outgoingEnergyChunks.slice(0, this.outgoingEnergyChunks.length);
            this.outgoingEnergyChunks.remove(energyChunks);
            this.energyChunks.remove(energyChunks);
            return models;
        },

        clearEnergyChunks: function() {
            EnergySystemElement.prototype.clearEnergyChunks.apply(this);

            this.outgoingEnergyChunks.reset();
        }

    });

    return EnergySource;
});
