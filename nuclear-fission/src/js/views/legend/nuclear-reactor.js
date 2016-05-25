define(function(require) {

    'use strict';

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
