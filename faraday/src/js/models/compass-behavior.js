define(function (require) {

    'use strict';

    var _ = require('underscore');

    var baseFunctions = {

        /**
         * Sets the compass needle direction.
         */
        setDirection: function(fieldVector, deltaTime) {},

        /**
         * Starts the compass needle moving immediately.
         */
        startMovingNow: function() {}

    };

    
    /**
     * ImmediateBehavior immediately sets the compass direction to
     *   match the direction of the B-field.
     */
    var Immediate = function(compassModel) {
        this.compassModel = compassModel;  
    };

    _.extend(Immediate.prototype, baseFunctions, {

        setDirection: function(fieldVector, deltaTime) {
            this.compassModel.set('direction', fieldVector.angle());
        }

    });

    /**
     * IncrementalBehavior tracks the B-field exactly, except when the
     *   delta angle exceeds some threshold.  When the threshold is
     *   exceeded, the needle angle changes incrementally over time.
     */
    var Incremental = function(compassModel) {
        this.compassModel = compassModel;  
    };

    var MAX_INCREMENT = Math.PI / 4;

    _.extend(Incremental.prototype, baseFunctions, {

        setDirection: function(fieldVector, deltaTime) {
            // Calculate the delta angle
            var fieldAngle = fieldVector.angle();
            var needleAngle = this.compassModel.get('direction');
            var delta = fieldAngle - needleAngle;
            var deltaSign = (delta < 0) ? -1 : 1;

            // Normalize the angle to the range -355...+355 degrees
            if (Math.abs(delta) >= (2 * Math.PI))
                delta = deltaSign * (delta % (2 * Math.PI));

            // Convert to an equivalent angle in the range -180...+180 degrees.
            if (delta > Math.PI)
                delta = delta - (2 * Math.PI);
            else if (delta < -Math.PI)
                delta = delta + (2 * Math.PI);

            if (Math.abs(delta) < MAX_INCREMENT) {
                // If the delta is small, perform simple rotation.
                this.compassModel.set('direction', fieldAngle);
            }
            else {
                // If the delta is large, rotate incrementally.
                delta = deltaSign * MAX_INCREMENT;
                this.compassModel.set('direction', needleAngle + delta);
            }
        }

    });

    /**
     * KinematicBehavior rotates the compass needle using the Verlet algorithm
     *   to mimic rotational kinematics.  The needle must overcome inertia, and it has
     *   angular velocity and angular acceleration. This causes the needle to accelerate
     *   at it starts to move, and to wobble as it comes to rest.
     */
    var Kinematic = function(compassModel) {
        this.compassModel = compassModel;  

        this.theta = 0; // Angle of needle orientation (in radians)
        this.omega = 0; // Angular velocity, the change in angle over time.
        this.alpha = 0; // Angular acceleration, the change in angular velocity over time.
    };

    var SENSITIVITY = 0.01 / 1000; // increase this to make the compass more sensitive to smaller fields
    var DAMPING     = 0.08 / 1000; // increase this to make the needle wobble less
    var THRESHOLD   = 0.2 * (Math.PI / 180); // angle at which the needle stops wobbling and snaps to the actual field orientation

    _.extend(Kinematic.prototype, baseFunctions, {

        setDirection: function(fieldVector, deltaTime) {
            var magnitude = fieldVector.length();
            //var angle = fieldVector.angle();
            var angle = Math.atan2(fieldVector.y, fieldVector.x);
// console.log(angle, this.theta)
// console.log(deltaTime)
            // Difference between the field angle and the compass angle.
            var phi = ((magnitude === 0 ) ? 0.0 : (angle - this.theta));
// console.log(phi.toFixed(5), this.alpha.toFixed(5), this.omega.toFixed(5), this.theta.toFixed(5))
            if (Math.abs(phi) < THRESHOLD) {
                // When the difference between the field angle and the compass angle is insignificant,
                // simply set the angle and consider the compass to be at rest.
                this.theta = angle;
                this.omega = 0;
                this.alpha = 0;
                this.compassModel.set('direction', this.theta);
            }
            else {
                // Use the Verlet algorithm to compute angle, angular velocity, and angular acceleration.

                // Step 1: orientation
                var thetaOld = this.theta;
// console.log((SENSITIVITY * Math.sin(phi) * magnitude), (DAMPING * this.omega))
                var alphaTemp = (SENSITIVITY * Math.sin(phi) * magnitude) - (DAMPING * this.omega);
// console.log(this.theta)
                this.theta = this.theta + (this.omega * deltaTime) + (0.5 * alphaTemp * deltaTime * deltaTime);
                if (this.theta !== thetaOld) {
                    // Set the compass needle direction.
                    this.compassModel.set('direction', this.theta);
                }

                // Step 2: angular accelaration
                var omegaTemp = this.omega + (alphaTemp * deltaTime);
                this.alpha = (SENSITIVITY * Math.sin(phi) * magnitude) - (DAMPING * omegaTemp);

                // Step 3: angular velocity
                this.omega = this.omega + (0.5 * (this.alpha + alphaTemp) * deltaTime);
            }
        },

        /**
         * Workaround to get the compass moving immediately.
         * In some situations, such as when the magnet polarity is flipped,
         * it can take quite awhile for the needle to start moving.
         * So we give the compass needle a small amount of
         * angular velocity to get it going.
         */
        startMovingNow: function() {
            this.omega = 0.03; // adjust as needed for desired behavior
        }

    });


    // Bundle them all up together under "CompassBehavior"
    var CompassBehavior = {
        Immediate: Immediate,
        Incremental: Incremental,
        Kinematic: Kinematic
    };


    return CompassBehavior;
});
