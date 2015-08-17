// add momentum and mass
define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2      = require('common/math/vector2');
    var MotionObject = require('common/models/motion-object');

    var ManualMovementStrategy     = require('models/movement-strategy/manual');
    var SinusoidalMovementStrategy = require('models/movement-strategy/sinusoidal');

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
            this.startPosition    = new Vector2(options.startPosition);
            this.previousPosition = new Vector2();
            this.setPosition(this.startPosition);

            this.accelerationHistory = [];
            // The history of the maximum acceleration the electron courld have had
            //   at a point in time. This is needed so viewers can properly scale
            //   the actual accelerations
            this.maxAccelerationHistory = [];

            // The history of what movement strategy was in place a point in time
            this.movementStrategyHistory = [];
            this.movementStrategy = new ManualMovementStrategy(this);

            this._staticFieldStrength  = new Vector2;
            this._dynamicFieldStrength = new Vector2;

            this.recordingHistory = true;

            for (var i = 0; i < RETARDED_FIELD_LENGTH; i++) {
                this.positionHistory[i] = new Vector2(this.startPosition);
                this.accelerationHistory[i] = new Vector2();
                this.maxAccelerationHistory[i] = new Vector2();
            }
        },

        /**
         * Runs every step of the simulation
         */
        update: function(time, deltaTime) {
            var dt = deltaTime;

            this.previousPosition.set(this.get('position'));

            // Update the movement strategy and our resulting velocity
            this.movementStrategy.update(dt);
            this.setVelocity(this.movementStrategy.getVelocity());

            if (this.recordingHistory) {
                this.recordPosition(this.get('position'));
            }

            // If the electron is using sinusoidal movement, we need to see if it's
            //   time to make frequency or amplitude changes
            if (this.movementStrategy instanceof SinusoidalMovementStrategy) {
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
                    if ((this.previousPosition.y - this.startPosition.y) * (this.get('position').y - this.startPosition.y) <= 0) {
                        ms.setAmplitude(this.newAmplitude);
                        this.changeAmplitude = false;
                    }
                }
            }
            
        },

        /**
         *
         */
        recordPosition: function(position) {
            var i;

            for (i = RETARDED_FIELD_LENGTH - 1; i > STEP_SIZE - 1; i--) {
                this.positionHistory[i].set(this.positionHistory[i - STEP_SIZE]);
                this.accelerationHistory[i].set(this.accelerationHistory[i - STEP_SIZE]);
                this.maxAccelerationHistory[i].set(this.maxAccelerationHistory[i - STEP_SIZE]);
                this.movementStrategyHistory[i] = this.movementStrategyHistory[i - STEP_SIZE];
            }

            var a = this.accelerationHistory[0];
            var df = (a.y - this.movementStrategy.getAcceleration() * B) / STEP_SIZE;
            for (i = 0; i < STEP_SIZE; i++) {
                this.positionHistory[i].set(position);
                this.accelerationHistory[i].y = this.movementStrategy.getAcceleration() * B + i * df;
                this.maxAccelerationHistory[i].y = this.movementStrategy.getMaxAcceleration() * B;
                this.movementStrategyHistory[i] = this.movementStrategy;
            }
        },

        /**
         * Tells if the field is zero between the electron and a specified x coordinate
         */
        isFieldOff: function(x) {
            var result = true;
            for (var i = 0; i < this.accelerationHistory.length && i < x && result == true; i++) {
                var field = this.accelerationHistory[i];
                if (field.x !== 0 || field.y !== 0)
                    result = false;
            }
            return result;
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
         * Returns the center of mass
         */
        getCenterOfMass: function() {
            return this.get('position');
        },

        /**
         * Returns the moment of inertia
         */
        getMomentOfInertia: function() {
            return 0;
        },

        /**
         * Returns the rest mass
         */
        getRestMass: function() {
            return REST_MASS;
        },

        /**
         * Calculates and returns the mass of the electron
         */
        getMass: function() {
            //mr = m0 /sqrt(1 - v2/c2)
            var vMag = this.get('velocity').length();
            var denom = Math.sqrt(1 - (vMag * vMag) / (Math.pow(Constants.SPEED_OF_LIGHT, 2)));
            var mr = REST_MASS / denom;
            return mr;
        },

        /**
         * Returns the y acceleration from historical acceleration values from
         *   a history-array index. The given history index must be an integer.
         */
        getAccelerationAt: function(x) {
            return this.accelerationHistory[Math.min(x, this.accelerationHistory.length - 1)].y;
        },

        /**
         * Returns the y position from historical position values from either
         *   a history-array index or a 2D point.
         */
        getPositionAt: function(x) {
            if (_.isObject(x)) {
                return this.getPositionAt(Math.floor(x.distance(this.get('position'))));
            }
            else
                return this.positionHistory[Math.min(x, this.positionHistory.length - 1)].y;
        },

        /**
         * Returns the movement strategy from history from a point in 2D space.
         */
        getMovementTypeAt: function(location) {
            var x = Math.floor(location.distance(this.get('position')));
            return this.movementStrategyHistory[x];
        },

        /**
         * Returns a the static electric field at a specified point. Note that to minimize
         *   memory allocation, the Vector2 returned is re-used by every call to this method.
         */
        getStaticFieldAt: function(location) {
            var staticFieldStrength = this._staticFieldStrength;

            staticFieldStrength.x = location.x - this.get('position').x;
            staticFieldStrength.y = location.y - this.get('position').y;
            staticFieldStrength.normalize();

            var distanceFromSource = location.distance(this.get('position'));
            staticFieldStrength.scale(B * STATIC_FIELD_SCALE / (distanceFromSource * distanceFromSource));

            return staticFieldStrength;
        },

        /**
         * Returns a the dynamic electric field at a specified point. Note that to minimize
         *   memory allocation, the Vector2 returned is re-used by every call to this method.
         */
        getDynamicFieldAt: function(location) {
            var fieldStrength = this._dynamicFieldStrength;

            // Hollywood here!  This computes the field based on the origin of the
            //   electron's motion, not its current position. But it looks better.
            var distanceFromSource = location.distance(this.startPosition);
            if (distanceFromSource === 0)
                throw 'Asked for r=0 field.';

            var generatingPos = this.positionHistory[parseInt(distanceFromSource)];

            // Determine the direction of the field.
            fieldStrength.x = -(location.y - generatingPos.y);
            if (location.x - generatingPos.x < 0)
                fieldStrength.x = -fieldStrength.x;
            fieldStrength.y = Math.abs(location.x - generatingPos.x);
            fieldStrength.normalize();

            // Set the magnitude of the field to the acceleration of the electron, reduced
            //   by the by the distance from the source.
            var acceleration = this.getAccelerationAt(parseInt(distanceFromSource));

            var distanceScaleFactor;
            if (distanceFromSource === 0)
                distanceScaleFactor = 1;
            else
                distanceScaleFactor = Math.pow(distanceFromSource, 0.5);
            fieldStrength.scale(acceleration / distanceScaleFactor);

            // The following factor is used to give the fall-off associated with being off-axis.
            if ( distanceFromSource == 0.0 ) {
                distanceFromSource = 1;
            }
            var dubsonFactor = Math.abs(location.x - this.startPosition.x) / distanceFromSource;
            fieldStrength.scale(dubsonFactor);

            return fieldStrength;
        },

        getStartPosition: function() {
            return this.startPosition;
        },

        setFrequency: function(freq) {
            if (this.movementStrategy instanceof SinusoidalMovementStrategy) {
                this.changeFreq = true;
                this.newFreq = freq;
            }
        },

        setAmplitude: function(amp) {
            if (this.movementStrategy instanceof SinusoidalMovementStrategy) {
                this.changeAmplitude = true;
                this.newAmplitude = amp;
            }
        },

        moveToNewPosition: function(newPosition) {
            if (this.movementStrategy instanceof ManualMovementStrategy)
                this.movementStrategy.setPosition(newPosition);
        },

        setMovementStrategy: function(movementStrategy) {
            this.movementStrategy = movementStrategy;
        } 

    });


    return Electron;
});
