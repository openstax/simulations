define(function(require) {

    'use strict';

    var Uranium238Nucleus = require('models/nucleus/uranium-238');
    var Nucleon           = require('models/nucleon');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var OneNucleusLegendView = require('nuclear-fission/views/legend/one-nucleus');

    /**
     * 
     */
    var ChainReactionLegendView = OneNucleusLegendView.extend({

        /**
         * Creates the views and labels that will be used to render the legend
         */
        initItems: function() {
            OneNucleusLegendView.prototype.initItems.apply(this, arguments);

            // Take the last one off so we can just push the other uraniums on the end
            var daughterNucleiItem = this.items.pop();
            
            var nucleusMVT = this.getNucleusMVT();
            var nucleusLabelScale = this.getNucleusLabelScale();

            // Uranium-238
            var uranium238 = Uranium238Nucleus.create();
            this.items.push({
                label: 'Uranium-238',
                displayObject: ParticleGraphicsGenerator.generateLabeledNucleus(uranium238, nucleusMVT, this.renderer, false, nucleusLabelScale, true)
            });

            // Uranium-239 which is a uranium-238 that has absorbed a neutron
            var uranium239 = Uranium238Nucleus.create();
            uranium239.captureParticle(Nucleon.create({ type: Nucleon.NEUTRON }));

            this.items.push({
                label: 'Uranium-239',
                displayObject: ParticleGraphicsGenerator.generateLabeledNucleus(uranium239, nucleusMVT, this.renderer, false, nucleusLabelScale, true)
            });

            // Then add the daughter nuclei back on the end
            this.items.push(daughterNucleiItem);
        }

    });

    return ChainReactionLegendView;
});
