define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CompositeAtomicNucleus   = require('models/nucleus/composite');
    var DaughterCompositeNucleus = require('models/nucleus/daughter-composite');
    var AlphaParticle            = require('models/alpha-particle');
    var Nucleon                  = require('models/nucleon');

    var Constants = require('constants');

    /**
     *  This class defines the behavior of the nucleus of Carbon 14, which
     *    exhibits beta decay behavior.
     */
    var Uranium235CompositeNucleus = CompositeAtomicNucleus.extend({

        defaults: _.extend({}, CompositeAtomicNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numProtons:  Constants.Uranium235CompositeNucleus.PROTONS,
            numNeutrons: Constants.Uranium235CompositeNucleus.NEUTRONS,
            // Interval from the time a neutron capture occurs until fission occurs.
            fissionInterval: 0
        }),

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

                // Position and add the particle
                freeParticle.set('tunnelingEnabled', true);
                freeParticle.setPosition(this.get('position'));
                freeParticle.setVelocity(0, 0);
                this.constituents.push(freeParticle);

                this.updateAgitationFactor();
                
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
         * Resets the nucleus to its original state, before any fission has occurred.
         */
        reset: function(freeNeutrons, daughterNucleus) {
            
            // Reset the fission time to 0, indicating that it shouldn't occur
            // until something changes.
            this.fissionTime = 0;

            // Set acceleration, velocity, and position back to 0.
            this.setPosition(0, 0);
            this.setVelocity(0, 0);
            this.setAcceleration(0, 0);

            var i;
            
            if (this.get('numNeutrons') < this.originalNumNeutrons) {
                // Fission has occurred, so we need to reabsorb the daughter
                //   nucleus and two of the free neutrons.
                if (freeNeutrons) {
                    for (i = 0; i < 2; i++) {
                        if (freeNeutrons.length >= 2) {
                            var neutron = freeNeutrons.at(freeNeutrons.length - 1 - i);
                            neutron.setVelocity(0, 0);
                            neutron.setPosition(this.get('position'));
                            neutron.set('tunnelingEnabled', true);

                            this.constituents.push(neutron);
                            this.set('numNeutrons', this.get('numNeutrons') + 1);
                            freeNeutrons.remove(neutron);
                        }
                        else {
                            // This should never occur, debug it if it does.
                            throw 'Error: Unexpected number of free neutrons on reset.';
                        }
                    }
                }
                
                if (daughterNucleus) {
                    var daughterConstituents = daughterNucleus.getConstituents();
                    
                    for (i = 0; i < daughterConstituents.length; i++) {
                        var constituent = daughterConstituents[i];

                        if (constituent instanceof AlphaParticle) {
                            this.numAlphas++;
                            this.set('numProtons', this.get('numProtons') + 2);
                            this.set('numNeutrons', this.get('numNeutrons') + 2);
                        }
                        else if (constituent instanceof Nucleon){
                            if (constituent.get('type') === Nucleon.PROTON)
                                this.set('numProtons', this.get('numProtons') + 1);
                            else
                                this.set('numNeutrons', this.get('numNeutrons') + 1);
                        }
                        else {
                            // This should never happen, and needs to be debugged if
                            // it does.
                            throw 'What is this?';
                        }
                        
                        this.constituents.push(constituent);
                    }
                }
            }
            else if (this.get('numNeutrons') === this.originalNumNeutrons + 1) {
                // We have been reset after having absorbed a neutron but before
                //   fissioning.  Free a neutron to get back to our original state.
                for (i = 0; i < this.constituents.length; i++) {
                    if (this.constituents[i] instanceof Nucleon && this.constituents[i].get('type') === Nucleon.NEUTRON) {
                        // This one will do.
                        freeNeutrons.add(this.constituents[i]);
                        this.constituents.splice(i, 1);
                        this.set('numNeutrons', this.get('numNeutrons') - 1);
                        break;
                    }
                }
            }
            
            // Position all the nucleons near the new center of the nucleus.
            for (var i = 0; i < this.constituents.length; i++) {
                var constituent = this.constituents[i];
                constituent.tunnel(this.get('position'), 0, this.get('diameter') / 2, this.get('tunnelingRegionRadius'));
            }
            
            // Update our agitation level.
            this.updateAgitationFactor();
            
            // Notify all listeners of the change to our atomic weight.
            this.triggerNucleusChange(null);
        },

        update: function(time, deltaTime) {
            CompositeAtomicNucleus.prototype.update.apply(this, arguments);

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
            var i;

            // Fission the nucleus.  First pull out three neutrons as 
            // byproducts of this decay event.
            var byProducts = [];
            var neutronByProductCount = 0;
            for (var i = this.constituents.length - 1; i >= 0 && neutronByProductCount < 3; i--) {
                if (this.constituents[i] instanceof Nucleon && this.constituents[i].get('type') === Nucleon.NEUTRON) {
                    byProducts.push(this.constituents[i]);
                    this.constituents.splice(i, 1);
                    neutronByProductCount++;
                    this.set('numNeutrons', this.get('numNeutrons') - 1);
                }
            }
            
            // Now pull out the needed number of protons, neutrons, and alphas
            //   to create the appropriate daughter nucleus.  The daughter
            //   nucleus created is Krypton-92, so the number of particles
            //   needed is calculated for this particular isotope.
            var numAlphasNeeded = 12;
            var numProtonsNeeded = 12;
            var numNeutronsNeeded = 32;
                
            var daughterNucleusConstituents = [];
            
            for (var i = this.constituents.length - 1; i >= 0; i--) {
                var constituent = this.constituents[i];
                
                if ((numNeutronsNeeded > 0) && (constituent instanceof Nucleon) && constituent.get('type') === Nucleon.NEUTRON) {
                    daughterNucleusConstituents.push(constituent);
                    this.constituents.splice(i, 1);
                    numNeutronsNeeded--;
                    this.set('numNeutrons', this.get('numNeutrons') - 1);
                }
                else if ((numProtonsNeeded > 0) && (constituent instanceof Nucleon) && constituent.get('type') === Nucleon.PROTON) {
                    daughterNucleusConstituents.push(constituent);
                    this.constituents.splice(i, 1);
                    numProtonsNeeded--;
                    this.set('numProtons', this.get('numProtons') - 1);
                }
                else if ((numAlphasNeeded > 0) && (constituent instanceof AlphaParticle)) {
                    daughterNucleusConstituents.push(constituent);
                    this.constituents.splice(i, 1);
                    numAlphasNeeded--;
                    this.numAlphas--;
                    this.set('numNeutrons', this.get('numNeutrons') - 2);
                    this.set('numProtons', this.get('numProtons') - 2);
                }
                
                if ((numNeutronsNeeded === 0) && (numProtonsNeeded === 0) && (numAlphasNeeded === 0)) {
                    // We've got all that we need.
                    break;
                }
            }
            
            var daughterNucleus = DaughterCompositeNucleus.create({
                position: this.get('position')
            }, {
                constituents: daughterNucleusConstituents
            });
            
            // Consolidate all of the byproducts.
            byProducts.push(daughterNucleus);
            
            // Send out the decay event to all listeners.
            this.triggerNucleusChange(byProducts);
        },

        /**
         * Update the agitation factor for this nucleus.
         */
        updateAgitationFactor: function() {
            // Determine the amount of agitation that should be exhibited by this
            //   particular nucleus based on its atomic weight.
            switch (this.get('numProtons')) {
                case 92:
                    // Uranium.
                    if (this.get('numNeutrons') == 143){
                        // Uranium 235.
                        this.agitationFactor = Uranium235CompositeNucleus.URANIUM_235_AGITATION_FACTOR;
                    }
                    else if (this.get('numNeutrons') == 144){
                        // Uranium 236.
                        this.agitationFactor = Uranium235CompositeNucleus.URANIUM_236_AGITATION_FACTOR;
                    }
                    break;
                    
                default:
                    this.agitationFactor = Uranium235CompositeNucleus.DEFAULT_AGITATION_FACTOR;
                    break;
            }
        },

        hasFissioned: function() {
            return (this.get('numNeutrons') < this.originalNumNeutrons);
        }

    }, Constants.Uranium235CompositeNucleus);

    return Uranium235CompositeNucleus;
});