define(function(require) {

    'use strict';

    var LegendView = require('views/legend');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * 
     */
    var BetaDecayLegendView = LegendView.extend({

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

            // Electron
            items.push({
                label: 'Electron',
                displayObject: ParticleGraphicsGenerator.generateElectron(this.mvt)
            });

            // Antineutrino
            items.push({
                label: 'Antineutrino',
                displayObject: ParticleGraphicsGenerator.generateAntineutrino(this.mvt)
            });

            this.items = items;
        }

    });

    return BetaDecayLegendView;
});
