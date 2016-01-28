define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AbstractAlphaDecayNucleus = require('models/nucleus/alpha-decay');

    var Constants = require('constants');

    /**
     * Base class for alpha-decay nuclei.  This class contains much of the behavior that
     *   is common to all nuclei that exhibit alpha decay.
     */
    var HeavyAdjustableHalfLifeNucleus = AbstractAlphaDecayNucleus.extend({

        defaults: _.extend(MotionObject.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numNeutrons: Constants.HeavyAdjustableHalfLifeNucleus.ORIGINAL_NUM_PROTONS,
            numProtons: Constants.HeavyAdjustableHalfLifeNucleus.ORIGINAL_NUM_NEUTRONS,
            halfLife: Constants.HeavyAdjustableHalfLifeNucleus.DEFAULT_HALF_LIFE
        }),

        /**
         * Resets the nucleus to its original state, before any decay has occurred.
         */
        reset: function(deltaTime) {
            AbstractAlphaDecayNucleus.prototype.reset.apply(this, arguments);
            
            // Reset the decay time to 0, indicating that it shouldn't occur
            //   until something changes.
            this.decayTime = 0;
            this.activatedLifetime = 0;

            this.triggerNucleusChange(null);
        }

    });

    return HeavyAdjustableHalfLifeNucleus;
});