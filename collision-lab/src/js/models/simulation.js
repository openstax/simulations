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
            defaultBallSettings: Constants.Simulation.DEFAULT_BALL_SETTINGS,
            oneDimensional: false,

            paused: true,
            timeScale: Constants.Simulation.DEFAULT_TIMESCALE,
            elasticity: 1,

            xCenterOfMass: 0,
            yCenterOfMass: 0
        }),
        
        initialize: function(attributes, options) {
            this.balls = new Backbone.Collection([],{
                model: Ball
            });

            Simulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.addBall();
            this.addBall();
        },

        /**
         * Overrides Simulation.update because we update time and
         *   deltaTime differently
         */
        update: function(time, deltaTime) {
            if (!this.get('paused')) {
                // Convert from milliseconds to seconds
                deltaTime = (deltaTime / 1000);
                this.updateSingleStep(deltaTime);
            }
        },

        /**
         * Runs through a single step of the simulation.
         */
        updateSingleStep: function(deltaTime) {

            if (this.starting || this.colliding) {
                // Use a fixed step duration for stability of the algorithm
                deltaTime = Constants.Simulation.STEP_DURATION;
            }

            if (this.colliding)
                this.colliding = false;
            if (this.starting)
                this.starting = false;

            // Multiply by our time scale
            deltaTime *= this.get('timeScale');

            // Go backwards in time if we're reversing
            if (this.reversing)
                deltaTime *= -1;
            
            // Update our last sim time and then our sim time
            if (!this.reversing)
                this.lastTime = this.time;
            this.time += deltaTime;

            // Update ball positions
            for (var i = 0; i < this.balls.length; i++) {
                this.balls.at(i).updatePositionFromVelocity(deltaTime);
                // this.checkAndProcessWallCollision(i);
            }

            if (this.reversing)
                this.lastTime = this.time;

            // Update our time attribute for the interface
            this.set('time', this.time);
        },

        /**
         * Adds a ball with appropriate default values
         */
        addBall: function() {
            this.balls.add(new Ball({
                color: Constants.Ball.COLORS[this.balls.length], 
                number: this.balls.length + 1,

                mass:     this.get('defaultBallSettings')[this.balls.length].mass,
                position: this.get('defaultBallSettings')[this.balls.length].position,
                velocity: this.get('defaultBallSettings')[this.balls.length].velocity
            }));
        },

        /**
         * Removes the last ball in the list of balls
         */
        removeBall: function() {
            this.balls.pop();
        },

        /**
         * Calculates the center of mass of all the balls and
         *   saves that value to xCenterOfMass and yCenterOfMass.
         */
        calculateCenterOfMass: function() {
            var totalMass = 0;
            var sumXiMi = 0;
            var sumYiMi = 0;

            for (var i = 0; i < this.balls.length; i++) {
                var mass = this.balls.at(i).get('mass');
                totalMass += mass;
                sumXiMi += mass * this.balls.at(i).get('position').x;
                sumYiMi += mass * this.balls.at(i).get('position').y;
            }
         
            this.set('xCenterOfMass', sumXiMi / totalMass);
            this.set('yCenterOfMass', sumYiMi / totalMass);       
        }

    });

    return CollisionLabSimulation;
});
