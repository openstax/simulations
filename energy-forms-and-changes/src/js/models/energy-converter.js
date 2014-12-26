define(function (require) {

    'use strict';

    var EnergySystemsElement   = require('models/energy-systems-element');
    var EnergyChunkCollection = require('models/energy-chunk-collection');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var EnergyConverter = EnergySystemsElement.extend({
        
        initialize: function(attributes, options) {
            EnergySystemsElement.prototype.initialize.apply(this, [attributes, options]);

            this.incomingEnergyChunks = new EnergyChunkCollection();
            this.outgoingEnergyChunks = new EnergyChunkCollection();
        },

        update: function(time, deltaTime, incomingEnergy) {},

        preloadEnergyChunks: function(incomingEnergyRate) {},

        getEnergyOutputRate: function() {},

        extractOutgoingEnergyChunks: function() {
            var models = this.outgoingEnergyChunks.slice(0, this.outgoingEnergyChunks.length);
            this.outgoingEnergyChunks.remove(energyChunks);
            this.energyChunks.remove(energyChunks);
            return models;
        },

        injectEnergyChunks: function(energyChunks) {
            this.incomingEnergyChunks.add(energyChunks);
        },

        clearEnergyChunks: function() {
            EnergySystemsElement.prototype.clearEnergyChunks.apply(this);

            this.incomingEnergyChunks.reset();
            this.outgoingEnergyChunks.reset();
        }

    });

    return EnergyConverter;
});
