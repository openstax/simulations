define(function(require) {

    'use strict';

    var LegendView = require('views/legend');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * 
     */
    var ChainReactionLegendView = LegendView.extend({

        initialize: function(options) {
            options = _.extend({
                scale: 16
            }, options);

            LegendView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Creates the views and labels that will be used to render the legend
         */
        initItems: function() {
            var items = [];

            // Neutron
            items.push({
                label: 'Neutron',
                displayObject: ParticleGraphicsGenerator.generateNeutron(this.mvt)
            });

            // Proton
            items.push({
                label: 'Proton',
                displayObject: ParticleGraphicsGenerator.generateProton(this.mvt)
            });

            // Uranium-235
            items.push({
                label: 'Uranium-235',
                displayObject: ParticleGraphicsGenerator.generateElectron(this.mvt)
            });

            // Daughter Nuclei
            items.push({
                label: 'Daughter Nuclei',
                displayObject: ParticleGraphicsGenerator.generateAntineutrino(this.mvt)
            });

            this.items = items;
        }

    });

    return ChainReactionLegendView;
});
