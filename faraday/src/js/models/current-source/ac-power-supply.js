define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AbstractCurrentSource = require('models/current-source');

    var Constants = require('constants');

    /**
     * 
     */
    var ACPowerSupply = AbstractCurrentSource.extend({

        defaults: _.extend({}, AbstractCurrentSource.prototype.defaults, {
            // Determines how high the amplitude can go. (0...1 inclusive)
            maxAmplitude: 1, // Biggest
            // Determines how fast the amplitude will vary. (0...1 inclusive)
            frequency: 1, // Fastest
            // The change in angle that occurred the last time stepInTime was called. (radians)
            stepAngle: 0, // Radians
        }),

        initialize: function(attributes, options) {
            AbstractCurrentSource.prototype.initialize.apply(this, arguments);

            // The current angle of the sine wave that describes the AC. (radians)
            this.angle = 0;
            // The change in angle at the current frequency. (radians)
            this.deltaAngle = (2 * Math.PI * this.get('frequency')) / ACPowerSupply.MIN_STEPS_PER_CYCLE;

            this.on('change:maxAmplitude', this.maxAmplitudeChanged);
            this.on('change:frequency',    this.frequencyChanged);
        },

        maxAmplitudeChanged: function(model, maxAmplitude) {
            this.angle = 0;
        },

        frequencyChanged: function(model, frequency) {
            this.angle = 0;
            this.deltaAngle = (2 * Math.PI * this.get('frequency')) / ACPowerSupply.MIN_STEPS_PER_CYCLE;
        },

        /*
         * Varies the amplitude over time, based on maxAmplitude and frequency.
         *   Guaranteed to hit all peaks and zero crossings.
         */
        update: function(time, deltaTime) {
            if (this.get('enabled')) {
                if (this.get('maxAmplitude') === 0) {
                    this.set('amplitude', 0);
                }
                else {
                    var previousAngle = this.angle;

                    // Compute the angle.
                    this.angle += (deltaTime * this.deltaAngle);

                    // The actual change in angle on this tick of the simulation clock.
                    this.set('stepAngle', this.angle - previousAngle);

                    // Limit the angle to 360 degrees.
                    if (this.angle >= 2 * Math.PI)
                        this.angle = this.angle % (2 * Math.PI);

                    // Calculate and set the amplitude.
                    this.set('amplitude', this.get('maxAmplitude') * Math.sin(this.angle));
                }
            }
        }

    }, Constants.ACPowerSupply);

    return ACPowerSupply;
});
