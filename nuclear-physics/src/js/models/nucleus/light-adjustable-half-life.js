define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AbstractBetaDecayNucleus = require('models/nucleus/beta-decay');

    var Constants = require('constants');

    /**
     * This class represents a non-composite nucleus that has an adjustable half
     *   life.  There is obviously no such thing in nature, so the atomic weight
     *   of the atom is chosen arbitrarily and other portions of the simulation
     *   must "play along".
     */
    var LightAdjustableHalfLifeNucleus = AbstractBetaDecayNucleus.extend({

        defaults: _.extend(MotionObject.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numNeutrons: Constants.LightAdjustableHalfLifeNucleus.PROTONS,
            numProtons:  Constants.LightAdjustableHalfLifeNucleus.NEUTRONS,
            // Different decay-time scaling factor for carbon-14
            decayTimeScalingFactor: Constants.LightAdjustableHalfLifeNucleus.DECAY_TIME_SCALING_FACTOR
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
        }

    });

    return LightAdjustableHalfLifeNucleus;
});