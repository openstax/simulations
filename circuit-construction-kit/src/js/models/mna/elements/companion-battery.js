define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MNAElement = require('models/mna/elements/element');

    /**
     * Battery model for the MNA circuit
     */
    var MNACompanionBattery = function(node0, node1, voltage) {
        MNAElement.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(MNACompanionBattery.prototype, MNAElement.prototype, {

        /**
         * Initializes the MNACompanionBattery's properties with provided initial values
         */
        init: function(node0, node1, voltage) {
            MNAElement.prototype.init.apply(this, [null, node0, node1]);

            this.voltage = voltage;
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNACompanionBattery, MNAElement);


    return MNACompanionBattery;
});