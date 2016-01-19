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
            this.listenTo(this.circuit.branches, 'start-junction-changed end-junction-changed', this.branchJunctionChanged);
            this.listenTo(this.circuit.branches, 'change:resistance change:internalResistance change:voltageDrop', this.branchPropertiesChanged);
        },

        initGrabBag: function() {
            var scale = 1.3;
            var MIN_RESISTANCE = Constants.MIN_RESISTANCE;
            var Images = Assets.Images;

            this.grabBagItems = [
                new GrabBagItem(Images.DOG,        Images.DOG_MASK,        'Dog',         Math.pow(10, 9),  2.5 * scale),
                new GrabBagItem(Images.HAND,       Images.HAND_MASK,       'Hand',        Math.pow(10, 6),  1.0 * scale),
                new GrabBagItem(Images.PENCIL,     Images.PENCIL_MASK,     'Pencil Lead', 300,              3.5 * scale),
                new GrabBagItem(Images.ERASER,     Images.ERASER_MASK,     'Eraser',      Math.pow(10, 9),  0.7 * scale),
                new GrabBagItem(Images.PENNY,      Images.PENNY_MASK,      'Penny',       MIN_RESISTANCE,   0.6 * scale),
                new GrabBagItem(Images.PAPER_CLIP, Images.PAPER_CLIP_MASK, 'Paper Clip',  MIN_RESISTANCE,   0.7 * scale),
                new GrabBagItem(Images.DOLLAR,     Images.DOLLAR_MASK,     'Dollar Bill', Math.pow(10, 9),  1.0 * scale)
            ];
        },

        resetComponents: function() {
            
        },

        setCircuit: function(circuit) {
            this.circuit.junctions.reset(circuit.junctions.models);
            this.circuit.branches.reset(circuit.branches.models);
            this.layoutElectrons();
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

        layoutConnectedElectrons: function(branch) {
            this.layout.layoutConnectedElectrons(branch);
        },

        junctionSplit: function(junction, newJunctions) {
            this.layout.layoutElectrons(this.circuit.branches.models);
        },

        circuitChanged: function() {
            this.modelChanged = true;
        },

        branchJunctionChanged: function(branch) {
            this.layoutConnectedElectrons(branch);
        },

        branchPropertiesChanged: function() {
            this.modelChanged = true;
        }

    });

    return CCKSimulation;
});
