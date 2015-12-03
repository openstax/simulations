define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');

    var Circuit                = require('models/circuit');
    var ElectronSet            = require('models/electron-set');
    var MNACircuitSolver       = require('models/mna/circuit-solver');
    var CircuitInteraction     = require('models/circuit-interaction');
    var ContstantDensityLayout = require('models/constant-density-layout');

    /**
     * Constants
     */
    //var Constants = require('constants');

    /**
     * 
     */
    var CCKSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                
            }, options);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.circuit = new Circuit();
            this.solver = new MNACircuitSolver();
            this.particleSet = new ElectronSet(this.circuit);
            this.layout = new ContstantDensityLayout(this.particleSet, this.circuit);

            CircuitInteraction.setModel(this);
        },

        resetComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            
        },

        layoutElectrons: function(branches) {
            if (branches === undefined)
                branches = this.circuit.branches.models;

            this.layout.layoutElectrons(branches);
        }

    });

    return CCKSimulation;
});
