define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Propagator = require('models/propagation');

    /**
     * Oscillates a positionable object along a specified axis
     */
    var OscillatePropagator = function(position0, amplitude, freq, amplitudeScale, axis) {
        this.axis = axis.normalize();
        this.amplitude = amplitude;
        this.position0 = position0;
        this.freq = freq;
        this.amplitudeScale = amplitudeScale;
        this.time = 0;

        this._pos = new Vector2();
        this._axis = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(OscillatePropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            this.time += deltaTime;
            this.amplitude = this.amplitude * this.amplitudeScale;
            
            var scale = this.amplitude * Math.sin(this.time * this.freq);
            var position = this._pos
                .set(this.position0)
                .add(this._axis
                    .set(this.axis)
                    .scale(scale)
                );

            particle.setPosition(position);
        },

        setAmplitude: function(amplitude) {
            this.amplitude = amplitude;
        },

        getAmplitude: function() {
            return this.amplitude;
        }

    });

    return OscillatePropagator;
});
