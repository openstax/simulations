define(function(require) {

    'use strict';

    var LegendView = require('views/legend');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * 
     */
    var RutherfordScatteringLegendView = LegendView.extend({

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

            // Electron
            items.push({
                label: 'Electron',
                displayObject: ParticleGraphicsGenerator.generateElectron(this.mvt)
            });

            // Proton
            items.push({
                label: 'Proton',
                displayObject: ParticleGraphicsGenerator.generateProton(this.mvt)
            });

            // Neutron
            items.push({
                label: 'Neutron',
                displayObject: ParticleGraphicsGenerator.generateNeutron(this.mvt)
            });

            // AlphaParticle
            items.push({
                label: 'Alpha Particle',
                displayObject: ParticleGraphicsGenerator.generateAlphaParticle(this.mvt)
            });

            this.items = items;
        }

    });

    return RutherfordScatteringLegendView;
});
