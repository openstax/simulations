define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var OscillatePropagator = require('common/propagator/oscillate');

    var OscillateFactory = function(vToAScale, decay, freq, aMax, axis) {
        this.axis = new Vector2(axis);
        this.freq = freq;
        this.vToAScale = vToAScale;
        this.decay = decay;
        this.aMax = aMax;
    };

    /**
     * Instance functions/properties
     */
    _.extend(OscillateFactory.prototype, {

        create: function(v, core) {
            // Create a random axis of oscillation.
            var xVal = Math.random() * 3 + 0.5;
            if (Math.random() >= 0.5)
                xVal = -xVal;
            axis.set(1, xVal);

            var x = Math.abs(v * this.vToAScale);
            var amp = 0;
            if (x < this.aMax)
                amp = v * this.vToAScale;
            else if (v < 0)
                amp = -this.aMax;
            else
                amp = this.aMax;

            return OscillatePropagator.create(core.get('origin'), amp, this.freq, this.decay, axis);
        }

    });

    return OscillateFactory;
});
