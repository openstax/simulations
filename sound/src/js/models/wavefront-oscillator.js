define(function (require) {

    'use strict';

    // This bower module doesn't satisfy AMD, so I'm just trying to satisfy the linter
    require('timbre'); var T = window.T;

    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * TODO: Make it actually play sounds like the original
     */
    var WavefrontOscillator = Backbone.Model.extend({

        defaults: {
            frequency: null,
            amplitude: null,
            harmonicFactor: 1,

            enabled: false,
            // This is a special overide flag so that the two source interference panel works.
            interferenceOverideEnabled: false,

            listener: null
        },

        initialize: function(attributes, options) {
            this.referencePoint = new Vector2();

            this.sound = T('sin');
            this.sound.set({
                frequency: Constants.DEFAULT_FREQUENCY,
                mul: 0
            });
            this.sound.play();

            this.on('change:frequency', this.frequencyChanged);
            this.on('change:amplitude', this.amplitudeChanged);
            this.on('change:enabled',   this.enabledChanged);
        },

        update: function(time, deltaTime) {
            var listener = this.get('listener');
            this.referencePoint.set(listener.get('position'));
            var frequency = listener.getFrequencyHeard() * this.get('harmonicFactor');
            var amplitude = listener.getAmplitudeHeard();

            if (amplitude < -1)
                throw 'amplitude < -1';

            // PhET note: We never set the frequency to 0, because otherwise the oscillator
            //   chokes. We need to make this assignment so that the following if() will test
            //   false when frequency == 0.  Note that that frequencyDisplayFactor must be
            //   used here, because the model uses a value for frequency that corresponds to
            //   what will appear on the screen. It would be better if the frequency in the
            //   model were accurate for the pitch of the sound, but I haven't figured out
            //   how to make that work yet.
            frequency = (frequency === 0) ? 0.1 : frequency * Constants.FREQUENCY_DISPLAY_FACTOR;
            this.set('frequency', frequency);
            this.set('amplitude', amplitude);
        },

        play: function() {
            this.sound.play();
        },

        pause: function() {
            this.sound.pause();
        },

        frequencyChanged: function(model, frequency) {
            this.sound.set({ freq: frequency });
        },

        amplitudeChanged: function(model, amplitude) {
            if (this.get('enabled'))
                this.sound.set({ mul: amplitude });
            else
                this.sound.set({ mul: 0 });
        },

        enabledChanged: function(model, enabled) {
            this.amplitudeChanged(this, this.get('amplitude'));
        }

    });

    return WavefrontOscillator;
});