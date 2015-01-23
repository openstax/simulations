define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Cannon = require('models/cannon');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var ProjectileMotionSimulation = Simulation.extend({

        defaults: {
            initialSpeed: 18, // m/s
            mass: 2,          // kg
            diameter: 0.1,    // m
            airResistanceEnabled: false, // Note: These air resistance variables need to be passed in to the
            dragCoefficient: 1,          //       trajectory's update function because they can be changed
            altitude: 0                  //       mid-flight
        },
        
        /**
         * Initialization code for moving man simulation models
         */
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            var cannon = new Cannon({
                x:     Constants.Cannon.START_X,
                y:     Constants.Cannon.START_Y,
                angle: Constants.Cannon.START_ANGLE
            });
            this.cannon = cannon;
        },

        _update: function(time, delta) {
            
        }

    });

    return ProjectileMotionSimulation;
});
