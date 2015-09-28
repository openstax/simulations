define(function (require) {

    'use strict';

    var _ = require('underscore');
    var Pool = require('object-pool');

    var Vector2 = require('common/math/vector2');

    var pool = Pool({
        init: function() {
            return new OscillatePropagator();
        }
    });

    var Propagator = require('models/propagator');

    /**
     * Oscillates a positionable object along a specified axis
     */
    var OscillatePropagator = function(position0, amplitude, freq, amplitudeScale, axis) {
        this.axis = new Vector2();
        this.position0 = new Vector2();

        this._pos = new Vector2();
        this._axis = new Vector2();

        // Call init with any arguments passed to the constructor
        this.init.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(OscillatePropagator.prototype, Propagator.prototype, {

        /**
         * Initializes the OscillatePropagator's properties with provided initial values
         */
        init: function(position0, amplitude, freq, amplitudeScale, axis) {
            this.axis.set(axis).normalize();
            this.position0.set(position0);
            this.amplitude = amplitude;
            this.freq = freq;
            this.amplitudeScale = amplitudeScale;
            this.time = 0;
        },

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
        },

        destroy: function() {
            pool.remove(this);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(OscillatePropagator, {

        /**
         * Initializes and returns a new instance from the object pool.
         *   Accepts the normal constructor parameters and passes them
         *   on to the created instance.
         */
        create: function() {
            var oscillate = pool.create();
            oscillate.init.apply(oscillate, arguments);
            return oscillate;
        }

    });

    return OscillatePropagator;
});
