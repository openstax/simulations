define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Simulation = require('common/simulation/simulation');
    var Rectangle  = require('common/math/rectangle');
    var Vector2    = require('common/math/vector2');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The base simulation model for the "Photon Absorption" tab
     */
    var PhotonAbsorptionSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            
        }),
        
        /**
         * 
         */
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        /**
         * Resets all component models
         */
        resetComponents: function() {
            
        },

        /**
         * Updates models
         */
        _update: function(time, deltaTime) {
            
        }

    });

    return PhotonAbsorptionSimulation;
});
