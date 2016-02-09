define(function (require) {

    'use strict';

    var _ = require('underscore');

    var BetaDecayCompositeNucleus = require('models/nucleus/beta-decay-composite');

    var Constants = require('constants');

    /**
     *  This class defines the behavior of the nucleus of Carbon 14, which
     *    exhibits beta decay behavior.
     */
    var Carbon14CompositeNucleus = BetaDecayCompositeNucleus.extend({

        defaults: _.extend({}, BetaDecayCompositeNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numProtons:  Constants.Carbon14CompositeNucleus.PROTONS,
            numNeutrons: Constants.Carbon14CompositeNucleus.NEUTRONS,
            // Carbon-14 half-life
            halfLife:    Constants.Carbon14CompositeNucleus.HALF_LIFE,
            // Different decay-time scaling factor for carbon-14
            decayTimeScalingFactor: Constants.Carbon14CompositeNucleus.DECAY_TIME_SCALING_FACTOR
        }),

        /**
         * Update the agitation factor for this nucleus.
         */
        updateAgitationFactor: function() {
            // Determine the amount of agitation that should be exhibited by this
            //   particular nucleus based on its atomic weight.
            switch (this.get('numProtons')) {
                case 6:
                    // Carbon
                    if (this.get('numNeutrons') === 8) {
                        // Carbon-14
                        this.agitationFactor = Carbon14CompositeNucleus.CARBON_14_AGITATION_FACTOR;
                    }
                    break;
                    
                case 7:
                    // Nitrogen
                    if (this.get('numNeutrons') === 7) {
                        // Nitrogen-14
                        this.agitationFactor = Carbon14CompositeNucleus.NITROGEN_14_AGITATION_FACTOR;
                    }
                    break;
                    
                default:
                    // If we reach this point in the code, there is a problem
                    //   somewhere that should be debugged.
                    console.error('Error: Unexpected atomic weight in beta decay nucleus.');
            }        
        },

    }, Constants.Carbon14CompositeNucleus);

    return Carbon14CompositeNucleus;
});