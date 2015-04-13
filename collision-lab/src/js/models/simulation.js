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
            defaultBallSettings: Constants.DEFAULT_BALL_SETTINGS,
            oneDimensional: false,

            elasticity: 1
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.balls = new Backbone.Collection([],{
                model: Ball
            });

            this.addBall();
            this.addBall();
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            
        },

        addBall: function() {
            this.balls.add(new Ball({
                color: Constants.Ball.COLORS[this.balls.length], 
                number: this.balls.length + 1,

                mass:     this.get('defaultBallSettings')[this.balls.length].mass,
                position: this.get('defaultBallSettings')[this.balls.length].position,
                velocity: this.get('defaultBallSettings')[this.balls.length].velocity
            }));
        },

        removeBall: function() {
            this.balls.pop();
        }

    });

    return CollisionLabSimulation;
});
