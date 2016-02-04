define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AbstractAlphaDecayNucleus = require('models/nucleus/alpha-decay');

    var Constants = require('constants');

    /**
     * This class represents a non-composite Polonium 211 nucleus.  In other words,
     *   this nucleus does not create or keep track of any constituent nucleons.
     */
    var Polonium211Nucleus = AbstractAlphaDecayNucleus.extend({

        defaults: _.extend(AbstractAlphaDecayNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numNeutrons: Constants.Polonium211Nucleus.ORIGINAL_NUM_PROTONS,
            numProtons: Constants.Polonium211Nucleus.ORIGINAL_NUM_NEUTRONS,
            halfLife: Constants.Polonium211Nucleus.HALF_LIFE
        }),

        /**
         * Resets the nucleus to its original state, before any decay has occurred.
         */
        reset: function(deltaTime) {
            AbstractAlphaDecayNucleus.prototype.reset.apply(this, arguments);

            if ((this.get('numNeutrons') !== this.originalNumNeutrons) || (this.get('numProtons') !== this.originalNumProtons)) {
                // Decay had occurred prior to reset.
                this.set('numNeutrons', this.originalNumNeutrons);
                this.set('numProtons', this.originalNumProtons);

                // Notify all listeners of the change to our atomic weight.
                this.triggerNucleusChange(null);
            }
        },

        /**
         * Activate the nucleus, meaning that it will now decay after some amount
         *   of time.
         */
        activateDecay: function(simulationTime) {
            // Only allow activation if the nucleus hasn't already decayed.
            if (this.get('numNeutrons') === Polonium211Nucleus.ORIGINAL_NUM_NEUTRONS) {
                this.decayTime = simulationTime + this.calculatePolonium211DecayTime();
            }
        },
        
        /**
         * Return a value indicating whether or not the nucleus has decayed.
         */
        hasDecayed: function(){
            if (this.get('numProtons') < Polonium211Nucleus.ORIGINAL_NUM_PROTONS)
                return true;
            else
                return false;
        },

        /**
         * This method generates a value indicating the number of milliseconds for
         *   a Polonium 211 nucleus to decay.  This calculation is based on the 
         *   exponential decay formula and uses the decay constant for Polonium 211.
         */
        calculatePolonium211DecayTime: function(){
            var randomValue = Math.random();
            if (randomValue > 0.999) {
                // Limit the maximum time for decay so that the user isn't waiting
                //   around forever.
                randomValue = 0.999;
            }
            var tunnelOutMilliseconds = (-(Math.log(1 - randomValue) / (0.693 / Polonium211Nucleus.HALF_LIFE)));
            return tunnelOutMilliseconds;
        }

    }, Constants.Polonium211Nucleus);

    return Polonium211Nucleus;
});