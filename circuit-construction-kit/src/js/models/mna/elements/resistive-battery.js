define(function (require) {

    'use strict';

    var MNAElement = require('models/mna/elements/element');

    /**
     * Battery model for the MNA circuit
     */
    var MNAResistiveBattery = MNAElement.extend({

        /**
         * Initializes the MNAResistiveBattery's properties with provided initial values
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
            console.log('current: ' + solution.getInstantaneousCurrent(this) + ', ' + solution.getTimeAverageCurrent(this))
        }

    });


    return MNAResistiveBattery;
});