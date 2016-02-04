define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AbstractBetaDecayNucleus = require('models/nucleus/beta-decay');

    var Constants = require('constants');

    /**
     * This class represents a non-composite Hydrogen 3 nucleus.  In other words,
     *   this nucleus does not create or keep track of any constituent nucleons.
     */
    var Hydrogen3Nucleus = AbstractBetaDecayNucleus.extend({

        defaults: _.extend(AbstractBetaDecayNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numNeutrons: Constants.Hydrogen3Nucleus.PROTONS,
            numProtons:  Constants.Hydrogen3Nucleus.NEUTRONS,
            // Different decay-time scaling factor for carbon-14
            decayTimeScalingFactor: Constants.Hydrogen3Nucleus.DECAY_TIME_SCALING_FACTOR
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
         * Return a value indicating whether or not the nucleus has decayed.
         */
        hasDecayed: function(){
            if (this.get('numNeutrons') < Hydrogen3Nucleus.ORIGINAL_NUM_PROTONS)
                return true;
            else
                return false;
        }

    });

    return Hydrogen3Nucleus;
});