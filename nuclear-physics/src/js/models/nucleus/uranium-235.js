define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AtomicNucleus   = require('models/atomic-nucleus');
    var DaughterNucleus = require('models/nucleus/daughter');
    var Nucleon         = require('models/nucleon');

    var Constants = require('constants');

    /**
     * This class represents a non-composite Uranium235 nucleus. In other words,
     *   this nucleus does not create or keep track of any constituent nucleons.
     */
    var Uranium235Nucleus = AtomicNucleus.extend({

        defaults: _.extend({}, AtomicNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numProtons:  Constants.Uranium235Nucleus.PROTONS,
            numNeutrons: Constants.Uranium235Nucleus.NEUTRONS,
            // Interval from the time a neutron capture occurs until fission occurs.
            fissionInterval: 0
        }),

        onCreate: function(attributes, options) {
            AtomicNucleus.prototype.onCreate.apply(this, [attributes, options]);

            // Time at which fission will occur.
            this.fissionTime = 0;
        },

        /**
         * Returns true if the particle can be captured by this nucleus, false if
         * not.  Note that the particle itself is unaffected, and it is up to the
         * caller to remove the captured particle from the model if desired.
         * 
         * @param freeParticle - The free particle that could potentially be
         * captured.
         * @return true if the particle is captured, false if not.
         */
        captureParticle: function(freeParticle, simulationTime) {
            var particleCaptured = false;
            
            if (freeParticle instanceof Nucleon && 
                freeParticle.get('type') === Nucleon.NEUTRON &&
                this.get('numNeutrons') == this.originalNumNeutrons
            ){
                // Increase our neutron count.
                this.set('numNeutrons', this.get('numNeutrons') + 1);
                
                // Let the listeners know that the atomic weight has changed.
                this.triggerNucleusChange(null);

                // Start a timer to kick off fission.
                this.fissionTime = simulationTime + this.get('fissionInterval');
                
                // Indicate that the particle was captured.
                particleCaptured = true;
            }
            
            return particleCaptured;
        },

        /**
         * Resets the nucleus to its original state, before any neutron absorption has
         * occurred.
         */
        reset: function() {
            AtomicNucleus.prototype.reset.apply(this, arguments);

            // Reset the fission time to 0, indicating that it shouldn't occur
            // until something changes.
            this.fissionTime = 0;
            
            if ((this.get('numNeutrons') !== this.originalNumNeutrons) || (this.get('numProtons') !== this.originalNumProtons)){
                // Fission or absorption has occurred.
                this.set('numNeutrons', this.originalNumNeutrons);
                this.set('numProtons', this.originalNumProtons);
                
                // Notify all listeners of the change to our atomic weight.
                this.triggerNucleusChange(null);
            }
        },

        /**
         * Updates the nucleus.  It generally 'agitates' a bit, may also perform some
         *   sort of decay, and may move.
         */
        update: function(time, deltaTime) {
            AtomicNucleus.prototype.update.apply(this, arguments);

            // See if fission should occur.
            if ((this.fissionTime !== 0) && (time >= this.fissionTime)) {
                // Fission the nucleus.  
                this.fission();

                // Set the fission time to 0 to indicate that no more fissioning
                // should occur.
                this.fissionTime = 0;
            }
        },

        fission: function() {
            // First create three neutrons as byproducts of this decay event.
            var byProducts = [];
            for (var i = 0; i < 3; i++) {
                byProducts.push(Nucleon.create({
                    type: Nucleon.NEUTRON, 
                    position: this.get('position'), 
                    tunnelingEnabled: false
                }));
            }
            this.set('numNeutrons', this.get('numNeutrons') - 3);

            // Now create the appropriate daughter nucleus and add it to the
            //   list of byproducts.
            byProducts.push(DaughterNucleus.create({
                position: this.get('position'),
                numProtons:  Uranium235Nucleus.DAUGHTER_NUCLEUS_PROTONS,
                numNeutrons: Uranium235Nucleus.DAUGHTER_NUCLEUS_NEUTRONS
            }));
            
            // Reduce our constituent particles appropriately.
            this.set('numNeutrons', this.get('numNeutrons') - Uranium235Nucleus.DAUGHTER_NUCLEUS_PROTONS);
            this.set('numProtons',  this.get('numProtons')  - Uranium235Nucleus.DAUGHTER_NUCLEUS_NEUTRONS);
            
            // Send out the decay event to all listeners.
            this.triggerNucleusChange(byProducts);
        },

        hasFissioned: function() {
            return (this.get('numNeutrons') < this.originalNumNeutrons);
        }

    }, Constants.Uranium235Nucleus);

    return Uranium235Nucleus;
});