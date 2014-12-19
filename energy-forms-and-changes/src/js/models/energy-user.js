define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var EnergyUser = Backbone.Model.extend({

        defaults: {
            supportingSurface: null
        },
        
        initialize: function(attributes, options) {},

        update: function(time, delta) {},

        preloadEnergyChunks: function(incomingEnergyRate) {

        },

        injectEnergyChunks: function(energyChunks) {

        },

        clearEnergyChunks: function() {
            
        }

    });

    return EnergyUser;
});
