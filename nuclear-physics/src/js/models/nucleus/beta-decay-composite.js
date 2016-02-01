define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CompositeAtomNucleus = require('models/nucleus/composite');
    var Nucleon              = require('models/nucleon');
    var NucleonType          = require('models/nucleon-type');

    var Constants = require('constants');

    /**
     * Base class for composite nuclei (i.e. nuclei that are made up of multiple
     *   individual protons and neutrons) that exhibit beta decay.
     */
    var BetaDecayCompositeNucleus = CompositeAtomNucleus.extend({

        initialize: function(attributes, options) {
            CompositeAtomNucleus.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Resets the nucleus to its original state, before any beta decay has
         * occurred.
         */
        reset: function() {
            CompositeAtomNucleus.prototype.reset.apply(this, arguments);

            if ((this.get('numNeutrons') !== this.originalNumNeutrons) || (this.get('numProtons') !== this.originalNumProtons)) {
                // Decay had occurred prior to reset.
                this.set('numNeutrons', this.originalNumNeutrons);
                this.set('numProtons', this.originalNumProtons);

                // Change one of the protons into a neutron.  NOTE: We go backwards
                //   through the list because that tends to yield a neutron which is
                //   less likely to be obscured by other nucleons, just due to the
                //   way that construction works.
                for (var i = this.constituents.length - 1; i >= 0; i--) {
                    var nucleon = this.constituents[i];
                    if (nucleon instanceof Nucleon && nucleon.get('type') === NucleonType.PROTON) {
                        nucleon.set('type', NucleonType.NEUTRON);
                        break;
                    }
                }
                
                // Update our agitation level.
                this.updateAgitationFactor();

                // Notify all listeners of the change to our atomic weight.
                this.triggerNucleusChange(null);
            }
        },

        /**
         * Take the actions that simulate beta decay.
         */
        decay: function(clockEvent) {
            CompositeAtomNucleus.prototype.decay.apply(this, arguments);

            // Update the numerical nucleus configuration.
            this.set('numNeutrons', this.get('numNeutrons') - 1);
            this.set('numProtons',  this.get('numProtons')  + 1);
            
            // Change one of the neutrons into a proton.  NOTE: We go backwards
            //   through the list because that tends to yield a proton which is
            //   less likely to be obscured by other nucleons, just due to the
            //   way that construction works.
            for (var i = this.constituents.length - 1; i >= 0; i--){
                var nucleon = this.constituents[i];
                if (nucleon instanceof Nucleon && nucleon.get('type') === NucleonType.NEUTRON) {
                    nucleon.set('type', NucleonType.PROTON);
                    break;
                }
            }

            // Create the emitted particles, which are an electron and an
            //   antineutrino.
            var byProducts = [];

            var angle = Math.random() * Math.PI * 2;
            var electron = new Electron({
                position: this.get('position'),
                velocity: new Vector2(
                    Math.cos(angle) * BetaDecayCompositeNucleus.ELECTRON_EMISSION_SPEED, 
                    Math.sin(angle) * BetaDecayCompositeNucleus.ELECTRON_EMISSION_SPEED
                )
            });
            byProducts.push(electron);

            angle = Math.random() * Math.PI * 2;
            var antineutrino = new Antineutrino({
                position: this.get('position'),
                velocity: new Vector2(
                    Math.cos(angle) * BetaDecayCompositeNucleus.ANTINEUTRINO_EMISSION_SPEED, 
                    Math.sin(angle) * BetaDecayCompositeNucleus.ANTINEUTRINO_EMISSION_SPEED
                )
            });
            byProducts.push(antineutrino);
            
            // Update our agitation factor.
            this.updateAgitationFactor();

            // Send out the decay event to all listeners.
            this.triggerNucleusChange(byProducts);
        }

    });

    return BetaDecayCompositeNucleus;
});