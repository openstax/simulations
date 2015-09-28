define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * 
     */
    var BatteryForcePropagator = function(minSpeed, maxSpeed) {
        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.forces = [];
        this.desiredVoltage = 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(BatteryForcePropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            var f = 0;
            for (var i = 0; i < this.forces.length; i++)
                f += this.forces[i].getForce(particle);
            
            var m = particle.mass;
            var v = particle.velocity;
            var x = particle.position;
            var a = f / m;

            v = v + a * deltaTime;

            if (this.desiredVoltage < 0) {
                // Going clockwise--Positive velocity required.
                if (v > this.maxSpeed)
                    v = this.maxSpeed;
                else if (v < this.minSpeed)
                    v = this.minSpeed;
            }
            else {
                if (v < -this.maxSpeed)
                    v = -this.maxSpeed;
                else if (v > -this.minSpeed)
                    v = -this.minSpeed;
            }
            
            particle.velocity = v;
            particle.position += v * deltaTime;
        },

        setMinSpeed: function(vMin) {
            this.minSpeed = vMin;
        },

        addForce: function(f) {
            this.forces.push(f);
        },

        voltageChanged: function(val) {
            this.desiredVoltage = val;

            this.setMinSpeed(Math.abs(val * 0.7));
        }

    });

    return BatteryForcePropagator;
});
