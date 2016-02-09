define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AtomicNucleus = require('models/atomic-nucleus');

    var Constants = require('constants');

    /**
     * This class contains much of the behavior that is common to all nuclei that
     *   exhibit beta decay.
     */
    var AbstractBetaDecayNucleus = AtomicNucleus.extend({

        /**
         * Resets the nucleus to its original state, before any decay has occurred.
         */
        reset: function(deltaTime) {
            AtomicNucleus.prototype.reset.apply(this, arguments);

            if ((this.get('numNeutrons') !== this.originalNumNeutrons) || (this.get('numProtons') !== this.originalNumProtons)) {
                // Decay had occurred prior to reset.
                this.set('numNeutrons', this.get('numNeutrons') + 1);
                this.set('numProtons',  this.get('numProtons')  - 1);

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

            // Create the emitted particles, which are an electron and an antineutrino.
            var byProducts = [];

            var angle = Math.random() * Math.PI * 2;
            var electron = new Electron({
                position: this.get('position'),
                velocity: new Vector2(
                    Math.cos(angle) * AbstractBetaDecayNucleus.ELECTRON_EMISSION_SPEED, 
                    Math.sin(angle) * AbstractBetaDecayNucleus.ELECTRON_EMISSION_SPEED
                )
            });
            byProducts.push(electron);

            angle = Math.random() * Math.PI * 2;
            var antineutrino = new Antineutrino({
                position: this.get('position'),
                velocity: new Vector2(
                    Math.cos(angle) * AbstractBetaDecayNucleus.ANTINEUTRINO_EMISSION_SPEED, 
                    Math.sin(angle) * AbstractBetaDecayNucleus.ANTINEUTRINO_EMISSION_SPEED
                )
            });
            byProducts.push(antineutrino);

            // Send out the decay event to all listeners.
            this.triggerNucleusChange(byProducts);
        }

    }, Constants.AbstractBetaDecayNucleus);

    return AbstractBetaDecayNucleus;
});