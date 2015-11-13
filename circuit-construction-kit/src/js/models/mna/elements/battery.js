define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MNAElement = require('models/mna/elements/element');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Battery model for the MNA circuit
     */
    var MNABattery = function(originalComponent, node0, node1) {
        MNAElement.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(MNABattery.prototype, MNAElement.prototype, {

        /**
         * Initializes the MNABattery's properties with provided initial values
         */
        init: function(originalComponent, node0, node1) {
            MNAElement.prototype.init.apply(this, arguments);

            this.resistance = originalComponent.get('resistance');
            this.voltage    = originalComponent.get('voltageDrop');
        },

        /**
         * Applies the solution back to the original component.
         */
        applySolution: function(solution) {
            this.originalComponent.set('mnaCurrent', solution.getInstantaneousCurrent(this));
            this.originalComponent.set('current',    solution.getTimeAverageCurrent(this));
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNABattery, MNAElement);


    return MNABattery;
});