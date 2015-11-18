define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MNAElement = require('models/mna/elements/element');

    /**
     * Inductor model for the MNA circuit
     */
    var MNAInductor = function(originalComponent, node0, node1) {
        MNAElement.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(MNAInductor.prototype, MNAElement.prototype, {

        /**
         * Initializes the MNAInductor's properties with provided initial values
         */
        init: function(originalComponent, node0, node1) {
            MNAElement.prototype.init.apply(this, arguments);

            this.current    = -originalComponent.get('mnaCurrent');
            this.voltage    =  originalComponent.get('mnaVoltageDrop');
            this.inductance =  originalComponent.get('inductance');
        },

        /**
         * Applies the solution back to the original component.
         */
        applySolution: function(solution) {
            this.originalComponent.set('current',       -solution.getTimeAverageCurrent(this));
            this.originalComponent.set('mnaCurrent',    -solution.getInstantaneousCurrent(this));
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
            clone.inductance = this.inductance;
            return clone;
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNAInductor, MNAElement);


    return MNAInductor;
});