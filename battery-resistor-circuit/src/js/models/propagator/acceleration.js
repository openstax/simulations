define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * Accelerates wire particles
     */
    var AccelerationPropagator = function(g, vmax, accelScale) {
        this.vmax = vmax;
        this.g = g;
        this.accelScale = accelScale;
    };

    /**
     * Instance functions/properties
     */
    _.extend(AccelerationPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, wireParticle) {
            var v = wireParticle.velocity + this.g * deltaTime;

            wireParticle.velocity = v;
            if ((v < 0 && this.g > 0) || (v > 0 && this.g < 0))  // Don't go backwards
                wireParticle.velocity = 0;

            // v = Math.min(v, this.vmax); Why is this not actually used?? - Patrick

            wireParticle.position = wireParticle.position + wireParticle.velocity * deltaTime;
        },

        voltageChanged: function(voltage) {
            this.g = -voltage * this.accelScale;
        }

    });

    return AccelerationPropagator;
});
