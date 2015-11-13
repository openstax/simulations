define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MNAElement = require('models/mna/elements/element');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Resistor model for the MNA circuit
     */
    var MNAResistor = function(originalComponent, node0, node1) {
        MNAElement.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(MNAResistor.prototype, MNAElement.prototype, {

        /**
         * Initializes the MNAResistor's properties with provided initial values
         */
        init: function(originalComponent, node0, node1) {
            MNAElement.prototype.init.apply(this, arguments);

            this.resistance = originalComponent.get('resistance');
            this.conductance = 1 / this.resistance;
        },

        /**
         * Applies the solution back to the original component.
         */
        applySolution: function(solution) {
            this.originalComponent.set('current',     solution.getTimeAverageCurrent(this));
            this.originalComponent.set('voltageDrop', solution.getTimeAverageVoltage(this)); // Use average since it doesn't feed back in to the MNA solution
            this.originalComponent.set('mnaCurrent',  solution.getInstantaneousCurrent(this));
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(MNAResistor, MNAElement);


    return MNAResistor;
});