define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');
    var Vector3 = require('common/math/vector3');

    var AbstractCircuit               = require('models/circuit');
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

                this.capacitors.push(capacitor);

                x += config.capacitorXSpacing;
            }
        },

        /**
         * Creates wires as shown in the diagram at the top of this file.
         */
        initWires: function(config, numberOfCapacitors) {
            var attrs = {
                wireThickness: config.wireThickness,
                wireExtent: config.wireExtent
            };
            var opts = {
                battery: this.battery,
                capacitors: this.capacitors
            };

            this.wires.push(new BatteryToCapacitorsTopWire(attrs, opts));
            this.wires.push(new BatteryToCapacitorsBottomWire(attrs, opts));
        },

        /**
         * Updates plate voltages
         */
        updatePlateVoltages: function() {
            for (var i = 0; i < this.capacitors.length; i++)
                this.capacitors[i].set('platesVoltage', this.getTotalVoltage());
        },

        /**
         * Gets the total capacitance of the circuit.
         * C_total = C1 + C2 + ... + Cn
         */
        getTotalCapacitance: function() {
            var sum = 0;
            for (var i = 0; i < this.capacitors.length; i++)
                sum += this.capacitors[i].getTotalCapacitance();
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
         * True if circle is touching part of the circuit that is connected
         *   to the battery's top terminal.
         */
        connectedToBatteryTop: function(point, radius) {
            // return this.battery.intersectsTopTerminal(shape) || 
            //     this.getTopWire().intersects(shape) || 
            //     this.intersectsSomeTopPlate(shape);
            return this.battery.touchesTopTerminal(point, radius) ||
                this.getTopWire().touches(point, radius) ||
                this.touchesSomeTopPlate(point, radius);
        },

        /**
         * True if shape is touching part of the circuit that is connected
         *   to the battery's bottom terminal.
         */
        connectedToBatteryBottom: function(point, radius) {
            // return this.battery.intersectsBottomTerminal(shape) || 
            //     this.getBottomWire().intersects(shape) || 
            //     this.intersectsSomeBottomPlate(shape);
            return this.battery.touchesBottomTerminal(point, radius) ||
                this.getBottomWire().touches(point, radius) ||
                this.touchesSomeBottomPlate(point, radius);
        },

        /**
         * True if the shape intersects any capacitor's top plate.
         */
        intersectsSomeTopPlate: function(shape) {
            throw 'intersectsSomeTopPlate is deprecated. Use touchesSomeTopPlate instead.';
        },

        /**
         * True if the shape intersects any capacitor's bottom plate.
         */
        intersectsSomeBottomPlate: function(shape) {
            throw 'intersectsSomeBottomPlate is deprecated. Use touchesSomeBottomPlate instead.';
        },

        /**
         * True if the point touches any capacitor's top plate.
         */
        touchesSomeTopPlate: function(point, radius) {
            for (var i = 0; i < this.capacitors.length; i++) {
                if (this.capacitor.touchesTopPlate(point, radius))
                    return true;
            }
            return false;
        },

        /**
         * True if the point touches any capacitor's top plate.
         */
        touchesSomeBottomPlate: function(point, radius) {
            for (var i = 0; i < this.capacitors.length; i++) {
                if (this.capacitor.touchesBottomPlate(point, radius))
                    return true;
            }
            return false;
        }

    });

    return ParallelCircuit;
});