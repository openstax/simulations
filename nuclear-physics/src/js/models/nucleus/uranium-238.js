define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AtomicNucleus = require('models/atomic-nucleus');
    var Nucleon       = require('models/nucleon');

    var Constants = require('constants');

    /**
     * 
     */
    var Uranium238Nucleus = AtomicNucleus.extend({

        defaults: _.extend({}, AtomicNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numProtons:  Constants.Uranium238Nucleus.PROTONS,
            numNeutrons: Constants.Uranium238Nucleus.NEUTRONS,
            // Uranium-238 half-life
            halfLife:    Constants.Uranium238Nucleus.HALF_LIFE,
            // Different decay-time scaling factor for uranium-238
            decayTimeScalingFactor: Constants.Uranium238Nucleus.DECAY_TIME_SCALING_FACTOR
        }),

        /**
         * Returns true if the particle can be captured by this nucleus, false if
         * not.  Note that the particle itself is unaffected, and it is up to the
         * caller to remove the captured particle from the model if desired.
         * 
         * @param freeParticle - The free particle that could potentially be
         * captured.
         * @return true if the particle is captured, false if not.
         */
        captureParticle: function(freeParticle) {
            var particleCaptured = false;
            
            if (freeParticle instanceof Nucleon && 
                freeParticle.get('type') === Nucleon.NEUTRON &&
                this.get('numNeutrons') == this.originalNumNeutrons
            ){
                // Increase our neutron count.
                this.set('numNeutrons', this.get('numNeutrons') + 1);
                
                // Let the listeners know that the atomic weight has changed.
                this.triggerNucleusChange(null);
                
                // Indicate that the nucleus was captured.
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
            
            if ((this.get('numNeutrons') !== this.originalNumNeutrons) || (this.get('numProtons') !== this.originalNumProtons)){
                // Fission or absorption has occurred.
                this.set('numNeutrons', this.originalNumNeutrons);
                this.set('numProtons', this.originalNumProtons);
                
                // Notify all listeners of the change to our atomic weight.
                this.triggerNucleusChange(null);
            }
        },

        /**
         * Activate the nucleus, meaning that it will now decay after some amount
         * of time.
         */
        activateDecay: function(simulationTime){
            // Only allow activation if the nucleus hasn't already decayed.
            if (this.get('numNeutrons') == this.originalNumNeutrons)
                this.decayTime = simulationTime + (this.calculateDecayTime() * this.get('decayTimeScalingFactor'));
        },

        decay: function(deltaTime) {
            // Decay into Lead 206.
            this.set('numNeutrons', this.get('numNeutrons') - 22);
            this.set('numProtons', this.get('numProtons') - 10);

            // Set the final value of the time that this nucleus existed prior to
            // decaying.
            this.activatedLifetime += deltaTime;
            
            // Send out the decay event to all listeners.
            this.triggerNucleusChange(null);
            
            // Set the decay time to 0 to indicate that decay has occurred and
            // should not occur again.
            this.decayTime = 0;
        }

    });

    return Uranium238Nucleus;
});