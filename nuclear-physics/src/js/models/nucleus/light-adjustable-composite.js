define(function (require) {

    'use strict';

    var _ = require('underscore');

    var BetaDecayCompositeNucleus = require('models/nucleus/beta-decay-composite');

    var Constants = require('constants');

    /**
     *  This class defines the behavior of a composite nucleus that exhibits beta
     *   decay and that has an adjustable half life.
     */
    var LightAdjustableCompositeNucleus = BetaDecayCompositeNucleus.extend({

        defaults: _.extend({}, BetaDecayCompositeNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numProtons:  Constants.LightAdjustableCompositeNucleus.PROTONS,
            numNeutrons: Constants.LightAdjustableCompositeNucleus.NEUTRONS,
            // Carbon-14 half-life
            halfLife:    Constants.LightAdjustableCompositeNucleus.HALF_LIFE,
            // Different decay-time scaling factor for carbon-14
            decayTimeScalingFactor: Constants.LightAdjustableCompositeNucleus.DECAY_TIME_SCALING_FACTOR
        }),

        /**
         * Update the agitation factor for this nucleus.
         */
        updateAgitationFactor: function() {
            // Determine the amount of agitation that should be exhibited by this
            // particular nucleus based on its atomic weight.
            switch (this.get('numProtons')) {

                case 8:
                    // Oxygen
                    this.agitationFactor = LightAdjustableCompositeNucleus.PRE_DECAY_AGITATION_FACTOR;
                    break;
                    
                case 9:
                    // Flourine
                    this.agitationFactor = LightAdjustableCompositeNucleus.POST_DECAY_AGITATION_FACTOR;
                    break;
                    
                default:
                    // If we reach this point in the code, there is a problem
                    //   somewhere that should be debugged.
                    console.error('Error: Unexpected atomic weight in beta decay nucleus.');
                    
            }
        }

    }, Constants.LightAdjustableCompositeNucleus);

    return LightAdjustableCompositeNucleus;
});