define(function (require) {

    'use strict';

    var Pool = require('object-pool');

    var Vector2 = require('common/math/vector2');

    var SoundListener = require('models/sound-listener');

    /**
     * Because Backbone simulations only see shallow changes, we need to
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
     * The TwoSourceSoundListener adds the ability to listen to two sources
     *   of sound.  In the original PhET sim, the logic for this was in the
     *   InterferenceListenerGraphic view with a "TODO" comment saying it
     *   should instead be in the model.  So now it's in the model where it
     *   belongs.
     */
    var TwoSourceSoundListener = SoundListener.extend({

        defaults: _.extend({}, SoundListener.prototype.defaults, {
            origin2: null // Location of second speaker
        }),

        initialize: function(attributes, options) {
            SoundListener.prototype.initialize.apply(this, arguments);

            this.set('origin2', vectorPool.create().set(this.get('origin2')));
        },

        /**
         * Function that facilitates setting origin while still triggering
         *   a change event.
         */
        setOrigin2: function(x, y, options) {
            var oldOrigin = this.get('origin2');
            
            if (x instanceof Vector2)
                this.set('origin2', vectorPool.create().set(x), y);
            else
                this.set('origin2', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldOrigin);
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            SoundListener.prototype.destroy.apply(this, [options]);
            vectorPool.remove(this.get('origin2'));
        },

        /**
         * Overrides SoundListener's update function so that it accounts for
         *   two sources when determining amplitude.
         */
        update: function(deltaTime) {
            // Determine the difference in distance of the listener's ear to
            //   each audio source in units of phase angle of the current
            //   frequency.
            var simulation = this.get('simulation');
            var wavefront = simulation.primaryWavefront

            var meterDistA = this.get('position').distance(this.get('origin'));
            var meterDistB = this.get('position').distance(this.get('origin2'));
            var wavefrontDistA = wavefront.getIndexFromMeters(meterDistA);
            var wavefrontDistB = wavefront.getIndexFromMeters(meterDistB);

            var lambda = wavefront.getWavelengthAtTime(0);
            var theta = ((wavefrontDistA - wavefrontDistB) / lambda) * Math.PI;

            // The amplitude factor for max amplitude is the sum of the two
            //   wavefront amplitudes times the cosine of the phase angle.
            var amplitudeA = simulation.get('amplitude');
            var maxAmplitude = amplitudeA * Math.abs(Math.cos(theta));
            
            var currentOctaveAmplitude = simulation.octaveWavefront.getMaxAmplitudeAtTime(wavefrontDistA);
            var currentFrequency = wavefront.getFrequencyAtTime(wavefrontDistA);

            this.amplitudeHeard = maxAmplitude;
            this.frequencyHeard = currentFrequency;
            this.octaveAmplitudeHeard = currentOctaveAmplitude;
        }

    });

    return TwoSourceSoundListener;
});
