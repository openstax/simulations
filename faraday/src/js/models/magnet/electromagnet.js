define(function (require) {

    'use strict';

    var _ = require('underscore');

    var clamp = require('common/math/clamp');

    var CoilMagnet = require('models/magnet/coil');

    var Constants = require('constants');

    /**
     * Electromagnet is the model of an electromagnet. It is derived from the
     *   CoilMagnet model.
     */
    var Electromagnet = CoilMagnet.extend({

        defaults: _.extend({}, CoilMagnet.prototype.defaults, {
            isFlipped: false,
            sourceCoilModel: null,
            currentSource: null
        }),

        initialize: function(attributes, options) {
            CoilMagnet.prototype.initialize.apply(this, arguments);

            this.on('change:currentSource', this.currentSourceChanged);
            this.currentSourceChanged(this, this.get('currentSource'));
        },

        /**
         * Updates current in the coil and strength of the magnet.
         */
        update: function() {
            var sourceCoilModel = this.get('sourceCoilModel');
            /* 
             * The magnet size is a circle that has the same radius as the coil.
             * Adding half the wire width makes it look a little better.
             */
            var diameter = (2 * sourceCoilModel.get('radius')) +  (sourceCoilModel.get('wireWidth') / 2);
            this.set('width',  diameter);
            this.set('height', diameter);
            
            // Current amplitude is proportional to amplitude of the current source.
            var amplitude = this.get('currentSource').get('amplitude');
            sourceCoilModel.set('currentAmplitude', amplitude);
            
            // Compute the electromagnet's emf amplitude.
            amplitude = (sourceCoilModel.get('numberOfLoops') / Constants.ELECTROMAGNET_LOOPS_MAX) * amplitude;
            amplitude = clamp(-1, amplitude, 1);
            
            // Flip the polarity
            if (amplitude >= 0 && this.get('isFlipped')) {
                this.flipPolarity();
                this.set('isFlipped', false);
            }
            else if (amplitude < 0 && !this.get('isFlipped')) {
                this.flipPolarity();
                this.set('isFlipped', true);
            }
            
            /* 
             * Set the strength.
             * This is a bit of a "fudge". 
             * We set the strength of the magnet to be proportional to its emf.
             */
            var strength = Math.abs(amplitude) * this.get('maxStrength');
            this.set('strength', strength);
        },

        currentSourceChanged: function(model, currentSource) {
            this.stopListening(model.previous('currentSource'));
            this.listenTo(currentSource, 'change', this.update);
        }

    });

    return Electromagnet;
});
