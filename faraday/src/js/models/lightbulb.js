define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var FaradayObject   = require('models/faraday-object');

    var Constants = require('constants');

    /**
     * FieldMeter is the model of a B-field meter.
     */
    var Lightbulb = FaradayObject.extend({

        initialize: function(attributes, options) {
            FaradayObject.prototype.initialize.apply(this, arguments);

            this.pickupCoilModel = options.pickupCoilModel;
            this.previousCurrentAmplitude = 0;

            /* Determines whether the lightbulb turns off when the current in the coil
             * changes direction.  In some cases (eg, the Generator or AC Electromagnet)
             * this is the desired behavoir.  In other cases (eg, polarity file of the 
             * Bar Magnet) this is not the desired behavior.
             */
            this.offWhenCurrentChangesDirection = false;

            // Cached objects
            

        },

        /**
         * Gets the intensity of the light.
         * Fully off is 0.0, fully on is 1.0.
         */
        getIntensity: function() {
            var intensity = 0.0;
            
            var currentAmplitude = this.pickupCoilModel.get('currentAmplitude');
            
            if (this.offWhenCurrentChangesDirection && (
                    (currentAmplitude >  0 && this.previousCurrentAmplitude <= 0 ) || 
                    (currentAmplitude <= 0 && this.previousCurrentAmplitude >  0 )
                )) {
                 // Current changed direction, so turn the light off.
                intensity = 0;
            }
            else {
                // Light intensity is proportional to amplitude of current in the coil.
                intensity = Math.abs(currentAmplitude);
                
                // Intensity below the threshold is effectively zero.
                if (intensity < Constants.CURRENT_AMPLITUDE_THRESHOLD)
                    intensity = 0;
            }
            
            this.previousCurrentAmplitude = currentAmplitude;
            
            return intensity;
        },

        /**
         * Returns whether the lightbulb turns off when the current in the coil
         */
        isOffWhenCurrentChangesDirection: function() {
            return this.offWhenCurrentChangesDirection;
        },

        update: function(time, deltaTime) {
            // if enabled, notify observers
        }

    });

    return Lightbulb;
});
