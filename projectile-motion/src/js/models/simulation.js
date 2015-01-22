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
            })
        },

        _update: function(time, delta) {
            
        }

    });

    return ProjectileMotionSimulation;
});
