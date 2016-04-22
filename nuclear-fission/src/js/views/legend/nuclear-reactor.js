define(function(require) {

    'use strict';

    var Uranium238Nucleus = require('models/nucleus/uranium-238');
    var Nucleon           = require('models/nucleon');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var OneNucleusLegendView = require('nuclear-fission/views/legend/one-nucleus');

    /**
     * 
     */
    var NuclearReactorLegendView = OneNucleusLegendView.extend({

        /**
         * Creates the views and labels that will be used to render the legend
         */
        initItems: function() {
            OneNucleusLegendView.prototype.initItems.apply(this, arguments);

            // Remove the proton and daughter nuclei
            this.items.pop();
            this.items.splice(1, 1);
        }

    });

    return NuclearReactorLegendView;
});
