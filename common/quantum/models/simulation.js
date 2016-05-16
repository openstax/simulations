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
            elementProperties: undefined
        }),

        getGroundState: function() {
            return this.get('elementProperties').getGroundState();
        },

        getCurrentElementProperties: function() {
            return this.get('elementProperties');
        },

        setCurrentElementProperties: function(elementProperties) {
            this.set('elementProperties', elementProperties);
        }

    });

    return QuantumSimulation;
});
