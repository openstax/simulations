define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * A propagator for moving electrons through the battery
     */
    var BatteryPropagator = function(plusRegion, minusRegion, system, volts, desiredVolts) {
        this.desiredVolts = desiredVolts;
        this.volts = volts;
        this.plusRegion = plusRegion;
        this.minusRegion = minusRegion;
        this.system = system;
    };

    /**
     * Instance functions/properties
     */
    _.extend(BatteryPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            var left  = this.countLeft();
            var right = this.countRight();
            var volts = right - left;

            if (volts < this.desiredVolts) // Go right
                particle.velocity = -this.volts;
            else if (volts > this.desiredVolts) // Go left
                particle.velocity = this.volts;
            else
                return;

            particle.position += particle.velocity * deltaTime;
        },

        countLeft: function() {
            var sum = 0;
            for (var i = 0; i < this.system.particles.length; i++) {
                if (this.plusRegion.contains(this.system.particles[i]))
                    sum++;
            }
            return sum;
        },

        countRight: function() {
            var sum = 0;
            for (var i = 0; i < this.system.particles.length; i++) {
                if (this.minusRegion.contains(this.system.particles[i]))
                    sum++;
            }
            return sum;
        },

        coreCountChanged: function(val) {},

        voltageChanged: function(voltage) {
            this.desiredVolts = voltage;
        }

    });

    return BatteryPropagator;
});
