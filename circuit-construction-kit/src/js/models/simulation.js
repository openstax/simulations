define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');

    var Circuit                = require('models/circuit');
    var ElectronSet            = require('models/electron-set');
    var MNACircuitSolver       = require('models/mna/circuit-solver');
    var CircuitInteraction     = require('models/circuit-interaction');
    var ContstantDensityLayout = require('models/constant-density-layout');
    var GrabBagItem            = require('models/grab-bag-item');

    /**
     * Constants
     */
    var Constants = require('constants');

    var Assets = require('assets');

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

            this.initGrabBag();

            CircuitInteraction.setModel(this);

            this.listenTo(this.circuit, 'junction-split',  this.junctionSplit);
            this.listenTo(this.circuit, 'circuit-changed', this.circuitChanged);
        },

        initGrabBag: function() {
            var scale = 1.3;
            var MIN_RESISTANCE = Constants.MIN_RESISTANCE;

            this.grabBagItems = [
                new GrabBagItem(Assets.Images.BULB_ON, 'Dollar Bill', Math.pow(10, 9),  1.0 * scale),
                new GrabBagItem(Assets.Images.BULB_ON, 'Paper Clip',  MIN_RESISTANCE,   0.7 * scale),
                new GrabBagItem(Assets.Images.BULB_ON, 'Penny',       MIN_RESISTANCE,   0.6 * scale),
                new GrabBagItem(Assets.Images.BULB_ON, 'Eraser',      Math.pow(10, 9),  0.7 * scale),
                new GrabBagItem(Assets.Images.PENCIL,  'Pencil Lead', 300,              3.5 * scale),
                new GrabBagItem(Assets.Images.BULB_ON, 'Hand',        Math.pow(10, 6),  1.0 * scale),
                new GrabBagItem(Assets.Images.BULB_ON, 'Dog',         Math.pow(10, 9),  2.5 * scale)
            ];
        },

        resetComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            if (this.circuit.isDynamic() || this.modelChanged) {
                this.circuit.update(time, deltaTime);
                this.solver.solve(this.circuit, deltaTime);
                this.modelChanged = false;
            }
            
            this.particleSet.update(time, deltaTime);
        },

        layoutElectrons: function(branches) {
            if (branches === undefined)
                branches = this.circuit.branches.models;

            this.layout.layoutElectrons(branches);
        },

        junctionSplit: function(junction, newJunctions) {
            console.log('split')
            this.layout.layoutElectrons(this.circuit.branches.models);
        },

        circuitChanged: function() {
            this.modelChanged = true;
        }

    });

    return CCKSimulation;
});
