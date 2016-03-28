define(function(require) {

    'use strict';

    var HalfLifeNucleusChooserView = require('radioactive-dating-game/views/nucleus-chooser/half-life');

    /**
     * 
     */
    var DecayRatesNucleusChooserView = HalfLifeNucleusChooserView.extend({

        /**
         * Creates the views and labels that will be used to render the list
         */
        initItems: function() {
            HalfLifeNucleusChooserView.prototype.initItems.apply(this, arguments);

            // Remove the custom nucleus option
            this.items.pop();
        }

    });

    return DecayRatesNucleusChooserView;
});
