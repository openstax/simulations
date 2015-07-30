define(function (require) {

    'use strict';

    var Pool = require('object-pool');

    var PositionableObject = require('common/v3/models/positionable-object');
    var Vector2            = require('common/v3/math/vector2');

    /**
     * Because Backbone models only see shallow changes, we need to
     *   create new objects when assigning a new value to an attribute
     *   if we want the event system to pick up the change.  Creating
     *   and destroying objects is expensive in a real-time system,
     *   especially when it's happening each frame on a lot of objects,
     *   so we're going to use an object pool to reuse old objects
     *   instead of just throwing them away.
     */
    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    var Constants = require('constants');

    /**
     * SoundListener is a model for the listener person graphic that keeps
     *   track of the speaker's location in model space and upon update
     *   uses its relative position to the sound's origin (the speaker) to
     *   calculate the amplitude and frequency that the listener hears.
     */
    var SoundListener = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            origin: null,    // The location of the speaker
            simulation: null // The simulation model
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, arguments);

            this.frequencyHeard = 0;
            this.amplitudeHeard = 0;
            this.octaveAmplitudeHeard = 0;

            this.set('origin', vectorPool.create().set(this.get('origin')));
        },

        /**
         * Function that facilitates setting origin while still triggering
         *   a change event.
         */
        setOrigin: function(x, y, options) {
            var oldOrigin = this.get('origin');
            
            if (x instanceof Vector2)
                this.set('origin', vectorPool.create().set(x), y);
            else
                this.set('origin', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldOrigin);
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            PositionableObject.prototype.destroy.apply(this, [options]);
            vectorPool.remove(this.get('origin'));
        },

        /**
         *
         */
        update: function(deltaTime) {
            var primaryWavefront = this.get('simulation').primaryWavefront
            var meterDistFromSource = this.get('position').distance(this.get('origin'));
            var wavefrontDist = primaryWavefront.getIndexFromMeters(meterDistFromSource);
            var currentFrequency = primaryWavefront.getFrequencyAtTime(wavefrontDist);
            var currentAmplitude = primaryWavefront.getMaxAmplitudeAtTime(wavefrontDist);
            var currentOctaveAmplitude = this.get('simulation').octaveWavefront.getMaxAmplitudeAtTime(wavefrontDist);
            
            this.frequencyHeard = currentFrequency;
            this.amplitudeHeard = currentAmplitude;
            this.octaveAmplitudeHeard = currentOctaveAmplitude;
        },

        getFrequencyHeard: function() {
            return this.frequencyHeard;
        },

        getAmplitudeHeard: function() {
            return this.amplitudeHeard;
        },

        getOctaveAmplitudeHeard: function() {
            return this.octaveAmplitudeHeard;
        }

    });

    return SoundListener;
});
