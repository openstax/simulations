define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Base simulation model for quantum physics simulations
     */
    var QuantumSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            photonSpeedScale: 1,
            currentElementProperties: undefined
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            
        },

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
