define(function (require) {

    'use strict';

    var MNAElement = require('models/mna/elements/element');


    /**
     * Capacitor model for the MNA circuit
     */
    var MNACapacitor = MNAElement.extend({

        /**
         * Initializes the MNACapacitor's properties with provided initial values
         */
        init: function(originalComponent, node0, node1) {
            MNAElement.prototype.init.apply(this, arguments);

            this.current     = originalComponent.get('mnaCurrent');
            this.voltage     = originalComponent.get('mnaVoltageDrop');
            this.capacitance = originalComponent.get('capacitance');
        },

        /**
         * Applies the solution back to the original component.
         */
        applySolution: function(solution) {
            this.originalComponent.set('current',        solution.getTimeAverageCurrent(this));
            this.originalComponent.set('mnaCurrent',     solution.getInstantaneousCurrent(this));
            this.originalComponent.set('voltageDrop',    solution.getTimeAverageVoltage(this));
            this.originalComponent.set('mnaVoltageDrop', solution.getInstantaneousVoltage(this));
        },

        /**
         * Updates the element's attributes with values from a given solution.
         */
        updateWithSolution: function(solution) {
            this.voltage = solution.getNodeVoltage(this.node1) - solution.getNodeVoltage(this.node0); 
            this.current = solution.getCurrent(this);
        },

        clone: function() {
            var clone = MNAElement.prototype.clone.apply(this, arguments);
            clone.current = this.current;
            clone.voltage = this.voltage;
            clone.capacitance = this.capacitance;
            return clone;
        }

    });


    return MNACapacitor;
});