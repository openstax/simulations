define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');

    /**
     * Base simulation model for quantum physics simulations
     */
    var QuantumSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {
            photonSpeedScale: 1,
            currentElementProperties: undefined
        }),

        getGroundState: function() {
            return this.get('currentElementProperties').getGroundState();
        },

        getCurrentElementProperties: function() {
            return this.get('currentElementProperties');
        },

        setCurrentElementProperties: function(elementProperties) {
            this.set('currentElementProperties', elementProperties);
        }

    });

    return QuantumSimulation;
});
