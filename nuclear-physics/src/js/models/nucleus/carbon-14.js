define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AbstractBetaDecayNucleus = require('models/nucleus/beta-decay');

    var Constants = require('constants');

    /**
     * This class represents a non-composite Carbon 14 nucleus.  Because it is
     *   non-composite, this nucleus does not create or keep track of any 
     *   constituent nucleons.
     */
    var Carbon14Nucleus = AbstractBetaDecayNucleus.extend({

        defaults: _.extend({}, AbstractBetaDecayNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numProtons:  Constants.Carbon14Nucleus.PROTONS,
            numNeutrons: Constants.Carbon14Nucleus.NEUTRONS,
            // Carbon-14 half-life
            halfLife:    Constants.Carbon14Nucleus.HALF_LIFE,
            // Different decay-time scaling factor for carbon-14
            decayTimeScalingFactor: Constants.Carbon14Nucleus.DECAY_TIME_SCALING_FACTOR,
            // Parameter that controls whether this nucleus returns a diameter value
            //   that is larger than carbon-14 is in real life.  This was added as a
            //   bit of "Hollywooding" so that carbon-14 wouldn't be so much smaller
            //   than heavier nuclei, such as Uranium.
            enlarged: false
        }),

        /**
         * Resets the nucleus to its original state, before any fission has occurred.
         */
        reset: function() {
            AbstractBetaDecayNucleus.prototype.reset.apply(this, arguments);

            if ((this.get('numNeutrons') !== this.originalNumNeutrons) || (this.get('numProtons') !== this.originalNumProtons)) {
                // Decay has occurred.
                this.set('numNeutrons', this.originalNumNeutrons);
                this.set('numProtons', this.originalNumProtons);

                // Notify all listeners of the change to our atomic weight.
                this.triggerNucleusChange(null);
            }
        },

        /**
         * This override is for "hollywooding" purposes - it provides a diameter
         *   that is nearly the same as Uranium so that we don't have to scale
         *   atoms of very different scales appearing on the same canvas.
         */
        updateDiameter: function() {
            if (this.get('enlarged'))
                this.set('diameter', 1.6 * Math.pow(100, 0.362)); // Return an artificially large value.
            else
                AbstractBetaDecayNucleus.prototype.updateDiameter.apply(this, arguments);
        }

    });

    return Carbon14Nucleus;
});