define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');
    var clamp   = require('common/math/clamp');

    var FaradayObject = require('models/faraday-object');

    var Constants = require('constants');

    /**
     * Voltmeter is the model of a compass.
     * 
     * Several types of compass behavior can be specified using setBehavior.
     *   In the case of KINEMATIC_BEHAVIOR, the compass needle attempts to be
     *   physically accurate with respect to force, friction, inertia, etc.
     *   Instead of jumping to an orientation, the needle will overshoot,
     *   then gradually reach equilibrium.
     */
    var Voltmeter = FaradayObject.extend({

        defaults: _.extend({}, FaradayObject.prototype.defaults, {
            needleAngle: Constants.Voltmeter.ZERO_NEEDLE_ANGLE,
            jiggleEnabled: false // Expensive, so disabled by default
        }),

        initialize: function(attributes, options) {
            FaradayObject.prototype.initialize.apply(this, arguments);

            this.pickupCoilModel = options.pickupCoilModel; // Magnet that the compass is observing.

            this.on('change:needleAngle', this.needleAngleChanged);
        },

        needleAngleChanged: function(model, needleAngle) {
            if (needleAngle > Voltmeter.MAX_NEEDLE_ANGLE)
                this.set('needleAngle', Voltmeter.MAX_NEEDLE_ANGLE);
            else if (needleAngle < Voltmeter.MIN_NEEDLE_ANGLE)
                this.set('needleAngle', Voltmeter.MIN_NEEDLE_ANGLE);
        },

        /**
         * Gets the desired needle deflection angle.
         * This is the angle that corresponds exactly to the voltage read by the meter.
         */
        getDesiredNeedleAngle: function() {
            // Use amplitude of the voltage source as our signal.
            var amplitude = this.pickupCoilModel.get('currentAmplitude');
            
            // Absolute amplitude below the threshold is effectively zero.
            if (Math.abs(amplitude) < Constants.CURRENT_AMPLITUDE_THRESHOLD)
                amplitude = 0;
            
            // Determine the needle deflection angle.
            return amplitude * MAX_NEEDLE_ANGLE;
        },

        /**
         * Updates the needle deflection angle.
         * If rotational kinematics are enabled, jiggle the needle around the zero point.
         */
        update: function(time, deltaTime) {
            if (this.get('enabled')) {
                // Determine the desired needle deflection angle.
                var needleAngle = this.getDesiredNeedleAngle();
                
                if (!this.get('jiggleEnabled')) {
                    // If jiggle is disabled, simply set the needle angle.
                    this.set('needleAngle', needleAngle);
                }
                else {
                    // If jiggle is enabled, make the needle jiggle around the zero point.
                    if (needleAngle != Voltmeter.ZERO_NEEDLE_ANGLE) {
                        this.set('needleAngle', needleAngle);
                    }
                    else {
                        var delta = this.get('needleAngle');
                        if (delta === 0) {
                            // Do nothing, the needle is "at rest".
                        }
                        else if (Math.abs(delta) < Voltmeter.NEEDLE_JIGGLE_THRESHOLD) {
                            // The needle is close enought to "at rest".
                            this.set('needleAngle', Voltmeter.ZERO_NEEDLE_ANGLE);
                        }
                        else {
                            // Jiggle the needle around the zero point.
                            var jiggleAngle = -delta * Voltmeter.NEEDLE_LIVELINESS;
                            jiggleAngle = clamp(-Voltmeter.NEEDLE_JIGGLE_ANGLE, jiggleAngle, +Voltmeter.NEEDLE_JIGGLE_ANGLE);
                            this.set('needleAngle', jiggleAngle);
                        }
                    }
                }
            }
        }

    }, Constants.Voltmeter);

    return Voltmeter;
});
