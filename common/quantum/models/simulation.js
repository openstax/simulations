define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    /**
     * Base simulation model for quantum physics simulations
     */
    var QuantumSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
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
