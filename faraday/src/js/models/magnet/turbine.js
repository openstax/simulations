define(function (require) {

    'use strict';

    var _ = require('underscore');

    var BarMagnet = require('models/magnet');

    var Constants = require('constants');

    /**
     * Turbine is the model of a simple turbine. It rotates at some speed, and its 
     *   rotation is measured in RPMs (rotations per minute).
     */
    var Turbine = BarMagnet.extend({

        defaults: _.extend({}, BarMagnet.prototype.defaults, {
            speed: 0,    // -1...+1 (see setSpeed)
            maxRPM: 100, // rotations per minute at full speed
            maxDelta: 0, // change in angle at full speed, in radians
        }),

        initialize: function(attributes, options) {
            BarMagnet.prototype.initialize.apply(this, arguments);

            this.on('change:maxRPM', this.maxRPMChanged);

            this.maxRPMChanged(this, this.get('maxRPM'));
        },

        maxRPMChanged: function(turbine, maxRPM) {
            // Pre-compute the maximum change in angle per clock tick.
            var framesPerSecond = Constants.CLOCK_FRAME_RATE;
            var framesPerMinute = 60 * framesPerSecond;
            this.set('maxDelta', (2 * Math.PI) * (maxRPM / framesPerMinute));
        },

        /**
         * Gets the number of rotations per minute at the current speed.
         */
        getRPM: function() {
            return Math.abs(this.get('speed') * this.get('maxRPM'));
        },

        /**
         * Update the turbine's direction, based on its speed.
         */
        update: function(time, deltaTime) {
            if (this.get('speed') !== 0) {
                
                // Determine the new direction
                var delta = deltaTime * this.get('speed') * this.get('maxDelta');
                var newDirection = this.get('direction') + delta;
                
                // Limit direction to -360...+360 degrees.
                var sign = (newDirection < 0) ? -1 : +1;
                newDirection = sign * (Math.abs(newDirection)  % (2 * Math.PI));

                this.set('direction', newDirection);
            }
        }

    });

    return Turbine;
});
