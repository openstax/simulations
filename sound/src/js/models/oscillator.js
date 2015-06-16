define(function (require) {

    'use strict';

    //var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var WavefrontType = require('models/wavefront-type');

    /**
     * Constants
     */
    var Constants = require('constants');
    var S_LENGTH = 400;

    /**
     * A movable target object that detects collisions with projectiles
     */
    var Oscillator = Backbone.Model.extend({

        defaults: {
            frequency: 0,
            amplitude: 1,
            harmonicFactor: 1,

            enabled: false,
            // This is a special overide flag so that the two source interference panel works.
            interferenceOverideEnabled: false,

            listener: null
        },

        initialize: function(attributes, options) {
            this.referencePoint = new Vector2();
        },

        update: function(time, deltaTime) {
            var listener = this.get('listener');
            this.referencePoint.set(listener.get('position'));
            var frequency = listener.get('frequencyHeard') * this.get('harmonicFactor');
            var amplitude = listener.get('amplitudeHeard');

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
        }

    });

    return Oscillator;
});