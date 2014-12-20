define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var EnergySystemElement   = require('models/energy-system-element');
    var EnergyChunkCollection = require('models/energy-chunk-collection');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var EnergyConverter = EnergySystemElement.extend({
        
        initialize: function(attributes, options) {
            EnergySystemElement.prototype.initialize.apply(this, [attributes, options]);

            this.incomingEnergyChunks = new EnergyChunkCollection();
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

        injectEnergyChunks: function(energyChunks) {
            this.incomingEnergyChunks.add(energyChunks);
        },

        clearEnergyChunks: function() {
            EnergySystemElement.prototype.clearEnergyChunks.apply(this);

            this.incomingEnergyChunks.reset();
            this.outgoingEnergyChunks.reset();
        }

    });

    return EnergyConverter;
});
