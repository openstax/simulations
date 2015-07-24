define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');
    var Vector3 = require('common/math/vector3');

    var AbstractCircuit               = require('models/circuit');
    var Capacitor                     = require('models/capacitor');
    var BatteryToCapacitorsTopWire    = require('models/wire/battery-to-capacitors-top');
    var BatteryToCapacitorsBottomWire = require('models/wire/battery-to-capacitors-bottom');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Model of a circuit with a battery (B) and N capacitors (C1...Cn) in parallel.
     * 
     * |-----|------|------|
     * |     |      |      |
     * B     C1     C2    C3
     * |     |      |      |
     * |-----|------|------|
     *
     */
    var ParallelCircuit = AbstractCircuit.extend({

        initialize: function(attributes, options) {
            AbstractCircuit.prototype.initialize.apply(this, [attributes, options]);

            this.updatePlateVoltages();
        },

        /**
         * Creates a row of capacitors as shown in the diagram at the top
         *   of this file.
         */
        initCapacitors: function(config, numberOfCapacitors) {
            var x = config.batteryLocation.x + config.capacitorXSpacing;
            var y = config.batteryLocation.y;
            var z = config.batteryLocation.z;

            var capacitors = this.capacitors;
            for (var i = 0; i < numberOfCapacitors; i++) {
                var capacitor = new Capacitor({
                    position: new Vector3(x, y, z),
                    plateWidth: config.plateWidth,
                    plateSeparation: config.plateSeparation,
                    dielectricMaterial: config.dielectricMaterial,
                    dielectricOffset: config.dielectricOffset
                });

                this.capacitors.add(capacitor);

                x += config.capacitorXSpacing;
            }
        },

        /**
         * Creates wires as shown in the diagram at the top of this file.
         */
        initWires: function(config, numberOfCapacitors) {
            var attrs = {
                thickness: config.wireThickness
            };
            var opts = {
                wireExtent: config.wireExtent,
                battery: this.battery,
                capacitors: this.capacitors.toArray()
            };

            this.wires.add(new BatteryToCapacitorsTopWire(attrs, opts));
            this.wires.add(new BatteryToCapacitorsBottomWire(attrs, opts));
        },

        /**
         * Updates plate voltages
         */
        updatePlateVoltages: function() {
            for (var i = 0; i < this.capacitors.length; i++)
                this.capacitors.at(i).set('platesVoltage', this.getTotalVoltage());
        },

        /**
         * Gets the total capacitance of the circuit.
         * C_total = C1 + C2 + ... + Cn
         */
        getTotalCapacitance: function() {
            var sum = 0;
            for (var i = 0; i < this.capacitors.length; i++)
                sum += this.capacitors.at(i).getTotalCapacitance();
            return sum;
        },

        /**
         * Gets the voltage at a shape, with respect to ground.
         * Returns Double.NaN if the Shape is not connected to the circuit
         */
        getVoltageAt: function(shape) {
            var voltage = NaN;
            if (this.connectedToBatteryTop(shape))
                voltage = this.getTotalVoltage();
            else if (this.connectedToBatteryBottom(shape))
                voltage = 0;
            return voltage;
        },

        /**
         * Gets the voltage at a certain circuit component, with respect to ground.
         *   Returns NaN if the component is not connected to the circuit.
         */
        getVoltageAt: function(component, touchesTopPart) {
            var voltage = NaN;
            if (this.connectedToBatteryTop(component, touchesTopPart))
                voltage = this.getTotalVoltage();
            else if (this.connectedToBatteryBottom(component, touchesTopPart))
                voltage = 0;
            return voltage;
        },

        /**
         * True if component is on part of the circuit that is connected
         *   to the battery's top terminal.
         */
        connectedToBatteryTop: function(component, touchesTopPart) {
            if (component === this.battery) {
                if (touchesTopPart)
                    return true;
                else
                    return false;
            }

            if (component === this.getTopWire())
                return true;

            if (component instanceof Capacitor && touchesTopPart)
                return true;

            return false;
        },

        /**
         * True if component is on part of the circuit that is connected
         *   to the battery's bottom terminal.
         */
        connectedToBatteryBottom: function(component, touchesTopPart) {
            if (component === this.battery) {
                if (touchesTopPart)
                    return false;
                else
                    return true;
            }

            if (component === this.getBottomWire())
                return true;

            if (component instanceof Capacitor && !touchesTopPart)
                return true;

            return false;
        }

    });

    return ParallelCircuit;
});