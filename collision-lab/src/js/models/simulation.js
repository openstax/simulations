define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');

    var Simulation = require('common/simulation/simulation');

    var Ball = require('models/ball');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var CollisionLabSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            oneDimensional: false,

            elasticity: 1
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);


            this.balls = new Backbone.Collection([
                new Ball({ color: Constants.Ball.COLORS[0], number: 1 }),
                new Ball({ color: Constants.Ball.COLORS[1], number: 2 })
            ],{
                model: Ball
            });
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return CollisionLabSimulation;
});
