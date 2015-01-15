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
            this.outgoingEnergyChunks.remove(models);
            this.energyChunks.remove(models);
            return models;
        },

        injectEnergyChunks: function(energyChunks) {
            this.incomingEnergyChunks.add(energyChunks);
        },

        clearEnergyChunks: function() {
            EnergySystemsElement.prototype.clearEnergyChunks.apply(this);

            // Remove and destroy the models
            var chunk;
            var i;
            for (i = this.incomingEnergyChunks.models.length - 1; i >= 0; i--) {
                chunk = this.incomingEnergyChunks.models[i];
                this.incomingEnergyChunks.remove(chunk);
                chunk.destroy();
            }
            for (i = this.outgoingEnergyChunks.models.length - 1; i >= 0; i--) {
                chunk = this.outgoingEnergyChunks.models[i];
                this.outgoingEnergyChunks.remove(chunk);
                chunk.destroy();
            }
        }

    });

    return EnergyConverter;
});
