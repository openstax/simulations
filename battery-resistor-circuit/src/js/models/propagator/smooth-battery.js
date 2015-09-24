define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Battery = require('models/propagator/battery');

    /**
     * A propagator for moving electrons through the battery, overwriting
     *   most of the behavior for its parent.
     */
    var SmoothBattery = function(plusRegion, minusRegion, system, volts, desiredVolts) {
        Battery.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(SmoothBattery.prototype, Battery.prototype, {

        propagate: function(deltaTime, particle) {
            var speed = this.getSpeed();
            particle.velocity = speed;
            particle.position += particle.velocity * deltaTime;
        },

        getSpeed: function() {
            var sign = 1;
            if (this.desiredVolts < 0)
                sign = -1;

            var abs = Math.abs(this.desiredVolts);
            if (abs <= .1)
                return 0;
            else if (abs <= 0.3)
                return -4 * sign;
            else if (abs <= 0.5)
                return -6 * sign;
            else if (abs <= 0.7)
                return -8 * sign;
            else if (abs <= 0.9)
                return -10 * sign;
            else if (abs <= 1.1)
                return -12 * sign;
            else if (abs < 1.3)
                return -14 * sign;
            else if (abs < 1.7)
                return -16 * sign;
            else if (abs < 1.9)
                return -18 * sign;
            else if (abs < 3.1)
                return -20 * sign;
            else if (abs < 5.1)
                return -22 * sign;
            else if (abs < 7.1)
                return -24 * sign;
            else if (abs < 9.1)
                return -26 * sign;
            else
                return -28 * sign;
        }

    });

    return SmoothBattery;
});
