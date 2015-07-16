define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Vector3 = require('common/math/vector3');

    var CapacitorLabSimulation = require('models/simulation');
    var SingleCircuit          = require('models/circuit/single');
    var DielectricMaterial     = require('models/dielectric-material');
    var Capacitor              = require('models/capacitor');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var DielectricSimulation = CapacitorLabSimulation.extend({

        defaults: _.extend(CapacitorLabSimulation.prototype.defaults, {
            startingDielectricOffset: Constants.DIELECTRIC_OFFSET_RANGE.defaultValue
        }),
        
        initialize: function(attributes, options) {
            CapacitorLabSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.listenTo(this.circuit, 'circuit-changed', function() {
                console.log(this.circuit.getTotalCapacitance());
            });
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initDielectricMaterials();
            this.initCircuit();
        },

        initDielectricMaterials: function() {
            this.dielectricMaterials = [
                new DielectricMaterial.Custom(),
                new DielectricMaterial.Teflon(),
                new DielectricMaterial.Paper(),
                new DielectricMaterial.Glass()
            ];
        },

        initCircuit: function() {
            var config = {
                batteryLocation:    DielectricSimulation.BATTERY_LOCATION,
                capacitorXSpacing:  DielectricSimulation.CAPACITOR_X_SPACING,
                capacitorYSpacing:  DielectricSimulation.CAPACITOR_Y_SPACING,
                plateWidth:         DielectricSimulation.PLATE_WIDTH,
                plateSeparation:    DielectricSimulation.PLATE_SEPARATION,
                dielectricMaterial: this.dielectricMaterials[0],
                dielectricOffset:   this.get('startingDielectricOffset'),
                wireThickness:      DielectricSimulation.WIRE_THICKNESS,
                wireExtent:         DielectricSimulation.WIRE_EXTENT
            };

            this.circuit = new SingleCircuit({ batteryConnected: DielectricSimulation.BATTERY_CONNECTED }, { config: config });
        },

        resetComponents: function() {
            this.dielectricMaterials[0].reset();
            this.circuit.reset();
        },

        _update: function(time, deltaTime) {
            
        },

        /**
         * Gets the maximum charge on the top plate (Q_total). We compute this with the
         *   battery connected because this is used to determine the range of the Plate
         *   Charge slider.
         */
        getMaxPlateCharge: function() {
            return this.getCapacitorWithMaxCharge().getTotalPlateCharge();
        },

        /**
         * Gets the maximum excess charge for the dielectric area (Q_excess_dielectric).
         */
        getMaxExcessDielectricPlateCharge: function() {
            return this.getCapacitorWithMaxCharge().getExcessDielectricPlateCharge();
        },

        /**
         * Gets a capacitor with maximum charge.
         */
        getCapacitorWithMaxCharge: function() {
            var material = new DielectricMaterial.Custom({ 
                dielectricConstant: Constants.DIELECTRIC_CONSTANT_RANGE.max
            });

            var capacitor = new Capacitor({
                plateWidth:         Constants.PLATE_WIDTH_RANGE.max,
                plateSeparation:    Constants.PLATE_SEPARATION_RANGE.min,
                dielectricMaterial: material,
                dielectricOffset:   Constants.DIELECTRIC_OFFSET_RANGE.min,
                platesVoltage:      Constants.BATTERY_VOLTAGE_RANGE.max
            });

            return capacitor;
        },

        /*
         * Gets the maximum effective E-field between the plates (E_effective).  The
         *   maximum occurs when the battery is disconnected, the Plate Charge control
         *   is set to its maximum, the plate area is set to its minimum, and the
         *   dielectric constant is min, and the dielectric is fully inserted. And in
         *   this situation, plate separation is irrelevant.
         */
        getMaxDielectricEField: function() {
            var material = new DielectricMaterial.Custom({ 
                dielectricConstant: Constants.DIELECTRIC_CONSTANT_RANGE.max
            });

            var circuitConfig = {
                batteryLocation:    new Vector3(),
                capacitorXSpacing:  DielectricSimulation.CAPACITOR_X_SPACING,
                capacitorYSpacing:  DielectricSimulation.CAPACITOR_Y_SPACING,
                plateWidth:         Constants.PLATE_WIDTH_RANGE.min,
                plateSeparation:    Constants.PLATE_SEPARATION_RANGE.min,
                dielectricMaterial: material,
                dielectricOffset:   Constants.DIELECTRIC_OFFSET_RANGE.min,
                wireThickness:      DielectricSimulation.WIRE_THICKNESS,
                wireExtent:         DielectricSimulation.WIRE_EXTENT
            };

            var circuit = new SingleCircuit({ batteryConnected: false }, { config: circuitConfig });
            circuit.set('disconnectedPlateCharge', this.getMaxPlateCharge());

            return circuit.capacitor.getDielectricEField();
        },

        /*
         * Gets the E-field reference magnitude, used to determine the initial scale of
         *   the E-Field Detector. This is based on the default capacitor configuration,
         *   with maximum battery voltage.
         */
        getEFieldReferenceMagnitude: function() {
            var material = new DielectricMaterial.Custom({ 
                dielectricConstant: Constants.DIELECTRIC_CONSTANT_RANGE.defaultValue
            });

            var capacitor = new Capacitor({
                plateWidth:         Constants.PLATE_WIDTH_RANGE.defaultValue,
                plateSeparation:    Constants.PLATE_SEPARATION_RANGE.defaultValue,
                dielectricMaterial: material,
                dielectricOffset:   Constants.DIELECTRIC_OFFSET_RANGE.defaultValue,
                platesVoltage:      Constants.BATTERY_VOLTAGE_RANGE.max
            });

            return capacitor.getEffectiveEField();
        }

    }, Constants.DielectricSimulation);

    return DielectricSimulation;
});
