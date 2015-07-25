define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Vector3 = require('common/math/vector3');

    var CapacitorLabSimulation = require('models/simulation');
    var DielectricMaterial     = require('models/dielectric-material');
    var Capacitor              = require('models/capacitor');
    var SingleCircuit          = require('models/circuit/single');  
    var SeriesCircuit          = require('models/circuit/series');
    var ParallelCircuit        = require('models/circuit/parallel');
    var Combination1Circuit    = require('models/circuit/combination-1');
    var Combination2Circuit    = require('models/circuit/combination-2');
    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var MultipleCapacitorsSimulation = CapacitorLabSimulation.extend({

        defaults: _.extend(CapacitorLabSimulation.prototype.defaults, {
            currentCircuitIndex: 0,
            circuit: null
        }),
        
        initialize: function(attributes, options) {
            CapacitorLabSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:currentCircuitIndex', this.currentCircuitIndexChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initCircuits();
        },

        initCircuits: function() {
            var dielectricMaterial = new DielectricMaterial.Air();

            var plateSeparation = Capacitor.calculatePlateSeparation(
                dielectricMaterial.get('dielectricConstant'), 
                MultipleCapacitorsSimulation.PLATE_WIDTH, 
                Constants.CAPACITANCE_RANGE.min
            );

            var config = {
                batteryLocation:    MultipleCapacitorsSimulation.BATTERY_LOCATION,
                capacitorXSpacing:  MultipleCapacitorsSimulation.CAPACITOR_X_SPACING,
                capacitorYSpacing:  MultipleCapacitorsSimulation.CAPACITOR_Y_SPACING,
                plateWidth:         MultipleCapacitorsSimulation.PLATE_WIDTH,
                plateSeparation:    plateSeparation,
                dielectricMaterial: dielectricMaterial,
                dielectricOffset:   MultipleCapacitorsSimulation.DIELECTRIC_OFFSET,
                wireThickness:      MultipleCapacitorsSimulation.WIRE_THICKNESS,
                wireExtent:         MultipleCapacitorsSimulation.WIRE_EXTENT
            };

            var circuits = {
                'Single':                      new SingleCircuit(      {}, { config: config }),
                '2 in Series':                 new SeriesCircuit(      {}, { config: config, numberOfCapacitors: 2 }),
                '3 in Series':                 new SeriesCircuit(      {}, { config: config, numberOfCapacitors: 3 }),
                '2 in Parallel':               new ParallelCircuit(    {}, { config: config, numberOfCapacitors: 2 }),
                '3 in Parallel':               new ParallelCircuit(    {}, { config: config, numberOfCapacitors: 3 }),
                '2 in Series + 1 in Parallel': new Combination1Circuit({}, { config: config }),
                '2 in Parallel + 1 in Series': new Combination2Circuit({}, { config: config })
            };

            this.circuits = _.values(circuits);
            this.circuitLabels = _.keys(circuits);

            this.currentCircuitIndexChanged(this, this.get('currentCircuitIndex'));
        },

        resetComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            for (var i = 0; i < this.circuits.length; i++)
                this.circuits[i].update(time, deltaTime);
        },

        currentCircuitIndexChanged: function(simulation, currentCircuitIndex) {
            var previousCircuit = this.circuits[this.previous('currentCircuitIndex')];
            if (previousCircuit) {
                var previousBatteryVoltage = previousCircuit.battery.get('voltage');
                this.circuits[currentCircuitIndex].battery.set('voltage', previousBatteryVoltage);
            }
            
            this.set('circuit', this.circuits[currentCircuitIndex]);
        }

    }, Constants.MultipleCapacitorsSimulation);

    return MultipleCapacitorsSimulation;
});
