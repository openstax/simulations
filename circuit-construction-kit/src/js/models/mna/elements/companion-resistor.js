define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MNAElement = require('models/mna/elements/element');

    /**
     * Battery model for the MNA circuit
     */
    var MNACompanionResistor = function(node0, node1, resistance) {
        MNAElement.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(MNACompanionResistor.prototype, MNAElement.prototype, {

        /**
         * Initializes the MNACompanionResistor's properties with provided initial values
         */
        init: function(node0, node1, resistance) {
            MNAElement.prototype.init.apply(this, [null, node0, node1]);

            this.resistance = resistance;
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNACompanionResistor, MNAElement);


    return MNACompanionResistor;
});