define(function (require) {

    'use strict';

    var Pool = require('object-pool');

    var PositionableObject = require('common/models/positionable-object');
    var Vector2            = require('common/math/vector2');

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
     * 
     */
    var SoundListener = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            origin: null,
            model: null,
            frequencyHeard: 0,
            amplitudeHeard: 0,
            octaveAmplitudeHeard: 0
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
            var primaryWavefront = this.get('model').primaryWavefront
            var meterDistFromSource = this.get('position').distance(this.get('origin'));
            var wavefrontDist = primaryWavefront.getIndexFromMeters(meterDistFromSource);
            var currentFrequency = primaryWavefront.getFrequencyAtTime(wavefrontDist);
            var currentAmplitude = primaryWavefront.getMaxAmplitudeAtTime(wavefrontDist);
            var currentOctaveAmplitude = this.get('model').octaveWavefront.getMaxAmplitudeAtTime(wavefrontDist);
            
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
