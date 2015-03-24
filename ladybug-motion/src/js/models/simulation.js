define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Ladybug = require('models/ladybug');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var LadybugMotionSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            this.ladybug = new Ladybug();

            Simulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return LadybugMotionSimulation;
});
