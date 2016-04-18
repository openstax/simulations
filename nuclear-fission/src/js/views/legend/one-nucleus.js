define(function(require) {

    'use strict';

    var ModelViewTransform = require('common/math/model-view-transform');

    var Uranium235Nucleus = require('models/nucleus/uranium-235');
    var DaughterNucleus   = require('models/nucleus/daughter');

    var LegendView = require('views/legend');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * 
     */
    var OneNucleusLegendView = LegendView.extend({

        initialize: function(options) {
            options = _.extend({
                scale: 16
            }, options);

            this.renderer = options.renderer;

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

            var nucleusMVT = new ModelViewTransform.createScaleMapping(this.scale * 0.5);
            var nucleusLabelScale = 0.4;

            // Uranium-235
            var uranium235 = Uranium235Nucleus.create();
            items.push({
                label: 'Uranium-235',
                displayObject: ParticleGraphicsGenerator.generateLabeledNucleus(uranium235, nucleusMVT, this.renderer, false, nucleusLabelScale, true)
            });

            // Daughter Nuclei
            var daughterMVT = new ModelViewTransform.createScaleMapping(this.scale * 0.5);
            var daughterNucleus1 = DaughterNucleus.create({ numProtons: 30, numNeutrons: 40 });
            var daughterNucleus2 = DaughterNucleus.create({ numProtons: 40, numNeutrons: 60 });
            var nucleusSprite1 = ParticleGraphicsGenerator.generateNucleus(daughterNucleus1, daughterMVT, this.renderer, false, true);
            var nucleusSprite2 = ParticleGraphicsGenerator.generateNucleus(daughterNucleus2, daughterMVT, this.renderer, false, true);
            nucleusSprite1.x = -40;
            nucleusSprite2.x = 40;

            var daughterNucleiContainer = new PIXI.Container();
            daughterNucleiContainer.addChild(nucleusSprite1);
            daughterNucleiContainer.addChild(nucleusSprite2);

            items.push({
                label: 'Daughter Nuclei',
                displayObject: daughterNucleiContainer,
                width: daughterNucleiContainer.width / 2,
                height: daughterNucleiContainer.height / 2
            });

            this.items = items;
        }

    });

    return OneNucleusLegendView;
});
