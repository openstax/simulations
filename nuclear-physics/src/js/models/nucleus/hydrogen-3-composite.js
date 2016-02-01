define(function (require) {

    'use strict';

    var _ = require('underscore');

    var BetaDecayCompositeNucleus = require('models/nucleus/beta-decay-composite');

    var Constants = require('constants');

    /**
     *  This class defines the behavior of the nucleus of Carbon 14, which
     *    exhibits beta decay behavior.
     */
    var Hydrogen3CompositeNucleus = BetaDecayCompositeNucleus.extend({

        defaults: _.extend(MotionObject.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numNeutrons: Constants.Hydrogen3CompositeNucleus.PROTONS,
            numProtons:  Constants.Hydrogen3CompositeNucleus.NEUTRONS,
            // Carbon-14 half-life
            halfLife:    Constants.Hydrogen3CompositeNucleus.HALF_LIFE,
            // Different decay-time scaling factor for carbon-14
            decayTimeScalingFactor: Constants.Hydrogen3CompositeNucleus.DECAY_TIME_SCALING_FACTOR
        }),

        /**
         * Update the agitation factor for this nucleus.
         */
        updateAgitationFactor: function() {
            // Determine the amount of agitation that should be exhibited by this
            // particular nucleus based on its atomic weight.
            switch (this.get('numProtons')) {
                case 1:
                    // Hydrogen.
                    if (this.get('numNeutrons') === 2) {
                        // Hydrogen-3
                        this.agitationFactor = Hydrogen3CompositeNucleus.HYDROGEN_3_AGITATION_FACTOR;
                    }
                    break;
                    
                case 2:
                    // Helium
                    if (this.get('numNeutrons') === 1) {
                        // Helium-3
                        this.agitationFactor = Hydrogen3CompositeNucleus.HELIUM_3_AGITATION_FACTOR;
                    }
                    break;
                    
                default:
                    // If we reach this point in the code, there is a problem
                    //   somewhere that should be debugged.
                    console.error('Error: Unexpected atomic weight in beta decay nucleus.');
            }
        }

    }, Constants.Hydrogen3CompositeNucleus);

    return Hydrogen3CompositeNucleus;
});