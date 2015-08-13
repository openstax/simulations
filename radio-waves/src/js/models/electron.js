// add momentum and mass
define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2      = require('common/math/vector2');
    var MotionObject = require('common/models/motion-object');

    var Constants = require('constants');
    var RETARDED_FIELD_LENGTH = 2000;
    // Fudge factor for scaling the field strength from the acceleration
    var B = 1000;
    var STATIC_FIELD_SCALE = 50;
    var REST_MASS = 1;
    var STEP_SIZE = Math.floor(Constants.SPEED_OF_LIGHT);

    /**
     * Represents a body with mass moving in space.
     */
    var Electron = MotionObject.extend({
        
        /**
         * Default attribute values
         */
        defaults: _.extend({}, MotionObject.prototype.defaults, {

        }),

        /**
         * Initializes the new electron
         */
        initialize: function(attributes, options) {
            options = _.extend({
                startPosition: null
            }, options);

            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            this.positionHistory = [];
            this.startPosition   = new Vector2(options.startPosition);
            this.currentPosition = new Vector2(this.startPosition);
            this.previousPosition = new Vector2();

            this.accelerationHistory = [];
            // The history of the maximum acceleration the electron courld have had
            //   at a point in time. This is needed so viewers can properly scale
            //   the actual accelerations
            this.maxAccelerationHistory = [];

            // The history of what movement strategy was in place a point in time
            this.movementStrategyHistory = [];
            this.movementStrategy = new ManualMovement();

            this.staticFieldStregnth  = new Vector2;
            this.dynamicFieldStrength = new Vector2;

            this.recordingHistory = true;

            for (var i = 0; i < RETARDED_FIELD_LENGTH; i++) {
                positionHistory[i] = new Vector2(this.startPosition);
                accelerationHistory[i] = new MutableVector2D();
                maxAccelerationHistory[i] = new MutableVector2D();
            }
        },

        /**
         * Runs every step of the simulation
         */
        update: function(time, deltaTime) {
            var dt = deltaTime;

            this.previousPosition.set(this.currentPosition);

            // Update the movement strategy and our resulting velocity
            this.movementStrategy.update(dt);
            this.setVelocity(this.movementStrategy.getVelocity());

            if (this.recordingHistory) {
                this.recordPosition(this.currentPosition);
            }

            // If the electron is using sinusoidal movement, we need to see if it's
            //   time to make frequency or amplitude changes
            if (this.movementStrategy instanceof SinusoidalMovement) {
                var ms = this.movementStrategy;
                // If we have a frequency change pending, determine if this is the
                //   right time to make it
                if (this.changeFreq) {
                    // This computation attempts to keep things in phase when the frequency changes
                    // If the new frequency isn't 0, compute the phase shift needed to keep the
                    //   electron moving smoothly
                    if (this.newFreq !== 0) {
                        var phi = ms.getRunningTime() * ((ms.getFrequency() / this.newFreq) - 1);
                        ms.setRunningTime(ms.getRunningTime() + phi);
                    }
                    ms.setFrequency(this.newFreq);
                    this.changeFreq = false;
                }

                // If we have an amplitude change pending, determine if this is the
                //   right time to make it
                if (this.changeAmplitude) {
                    if ((this.previousPosition.y - this.startPosition.y) * (this.currentPosition.y - this.startPosition.y) <= 0) {
                        ms.setAmplitude(this.newAmplitude);
                        this.changeAmplitude = false;
                    }
                }
            }
            
        },

        /**
         * Returns the total kinetic energy of the body, translational
         *   and rotational.
         */
        getKineticEnergy: function() {
            return (this.get('mass') * this.get('velocity').lengthSq() / 2) +
                this.getMomentOfInertia() * this.get('omega') * this.get('omega') / 2;
        },

        /**
         * Gets center of mass
         */
        getCenterOfMass: function() {},

        /**
         * Gets moment of inertia
         */
        getMomentOfInertia: function() {},

        /**
         * Calculates and returns the mass of the electron
         */
        getMass: function() {

        }

    });


    return Electron;
});
