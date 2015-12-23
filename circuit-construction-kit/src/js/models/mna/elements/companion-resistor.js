define(function (require) {

    'use strict';

    var MNAElement = require('models/mna/elements/element');

    /**
     * Battery model for the MNA circuit
     */
    var MNACompanionResistor = MNAElement.extend({

        /**
         * Initializes the MNACompanionResistor's properties with provided initial values
         */
        init: function(node0, node1, resistance) {
            MNAElement.prototype.init.apply(this, [null, node0, node1]);

            this.resistance = resistance;
        }

    });


    return MNACompanionResistor;
});