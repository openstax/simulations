define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var EnergySystemElement   = require('models/energy-system-element');
    var EnergyChunkCollection = require('models/energy-chunk-collection');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var EnergyUser = EnergySystemElement.extend({
        
        initialize: function(attributes, options) {
            EnergySystemElement.prototype.initialize.apply(this, [attributes, options]);

            this.incomingEnergyChunks = new EnergyChunkCollection();
        },

        preloadEnergyChunks: function(incomingEnergyRate) {},

        injectEnergyChunks: function(energyChunks) {
            this.incomingEnergyChunks.add(energyChunks);
        },

        clearEnergyChunks: function() {
            EnergySystemElement.prototype.clearEnergyChunks.apply(this);

            this.incomingEnergyChunks.reset();
        }

    });

    return EnergyUser;
});
