define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AtomicNucleus = require('models/atomic-nucleus');
    var AlphaParticle = require('models/alpha-particle');

    var Constants = require('constants');

    /**
     * Base class for alpha-decay nuclei.  This class contains much of the behavior that
     *   is common to all nuclei that exhibit alpha decay.
     */
    var AbstractAlphaDecayNucleus = AtomicNucleus.extend({

        /**
         * Take the actions that simulate alpha decay.
         */
        decay: function(deltaTime) {
            AtomicNucleus.prototype.decay.apply(this, arguments);
            
            this.set('numNeutrons', this.get('numNeutrons') - 2);
            this.set('numProtons',  this.get('numProtons')  - 2);

            var byProducts = [
                AlphaParticle.create({
                    position: this.get('position')
                })
            ];

            this.triggerNucleusChange(byProducts);
        }

    });

    return AbstractAlphaDecayNucleus;
});