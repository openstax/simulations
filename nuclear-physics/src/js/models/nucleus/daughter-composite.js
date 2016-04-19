define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CompositeAtomicNucleus = require('models/nucleus/composite');

    var Constants = require('constants');

    /**
     *  This class defines the behavior of the nucleus of a daughter nucleus
     */
    var DaughterCompositeNucleus = CompositeAtomicNucleus.extend({

        onCreate: function(attributes, options) {
            CompositeAtomicNucleus.prototype.onCreate.apply(this, [attributes, options]);

            // Set the tunneling region to be more confined than in some of the
            //   other panels, since having a bunch of alpha particles flying around
            //   the nucleus will like be distracting.
            this.set('tunnelingRegionRadius', (this.get('diameter') / 2) * 1.1);

            // Time at which fission will occur.
            this.fissionTime = 0;
        },

        /**
         * Resets the nucleus to its original state, before any fission has occurred.
         */
        reset: function(freeNeutrons, daughterNucleus) {
            this.constituents = [];
            this.numAlphas = 0;
            this.set('numProtons', 0);
            this.set('numNeutrons', 0);
            
            // Notify all listeners of the change to our atomic weight.
            this.triggerNucleusChange(null);
        },

        /**
         * Update the agitation factor for this nucleus.
         */
        updateAgitationFactor: function() {
            // Determine the amount of agitation that should be exhibited by this
            //   particular nucleus based on its atomic weight.
            switch (this.get('numProtons')) {
                case 36:
                    // Krypton.
                    if (this.get('numNeutrons') === 56) {
                        // Krypton 92.
                        this.agitationFactor = DaughterCompositeNucleus.KRYPTON_92_AGITATION_FACTOR;
                    }
                    else {
                        // Some other Krypton isotope.
                        this.agitationFactor = DaughterCompositeNucleus.DEFAULT_AGITATION_FACTOR;
                    }
                    break;
                    
                default:
                    this.agitationFactor = DaughterCompositeNucleus.DEFAULT_AGITATION_FACTOR;
                    break;
            }
        },

    }, Constants.DaughterCompositeNucleus);

    return DaughterCompositeNucleus;
});