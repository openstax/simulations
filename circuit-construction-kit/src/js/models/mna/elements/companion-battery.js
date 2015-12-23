define(function (require) {

    'use strict';

    var MNAElement = require('models/mna/elements/element');

    /**
     * Battery model for the MNA circuit
     */
    var MNACompanionBattery = MNAElement.extend({

        /**
         * Initializes the MNACompanionBattery's properties with provided initial values
         */
        init: function(node0, node1, voltage) {
            MNAElement.prototype.init.apply(this, [null, node0, node1]);

            this.voltage = voltage;
        }

    });


    return MNACompanionBattery;
});