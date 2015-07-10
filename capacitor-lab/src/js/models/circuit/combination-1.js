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
     * Model of a circuit with a battery (B), 2 capacitors in series (C1, C2), and one additional in parallel (C3).
     * 
     *   |-----|------|
     *   |     |      |
     *   |     C1     |
     *   |     |      |
     *   B     |      C3
     *   |     |      |
     *   |     C2     |
     *   |     |      |
     *   |-----|------|
     * 
     * At first glance, this class appears to duplicate code from Combination2Circuit. But there are subtle
     *   differences, and the commonalities are only due to coincidences in the how the components are numbered
     *   in the circuit diagram.  It would be a mistake to extract common functionality based on these factors,
     *   since one or the other circuit could change in the future. Unlike the other circuits, these 2 circuit
     *   are very specific, one-of-a-kind, and there's really no meaningful base class that safely describes
     *   them both.
     */
    var Combination1Circuit = AbstractCircuit.extend({

        initialize: function(attributes, options) {
            AbstractCircuit.prototype.initialize.apply(this, [attributes, options]);

            this.c1 = this.capacitors[0];
            this.c2 = this.capacitors[1];
            this.c3 = this.capacitors[2];

            this.updatePlateVoltages();
        },

        /**
         * Creates a row of capacitors as shown in the diagram at the top
         *   of this file.
         */
        initCapacitors: function(config, numberOfCapacitors) {
            var x = config.batteryLocation.x + config.capacitorXSpacing;
            var y = config.batteryLocation.y - (0.5 * config.capacitorYSpacing);
            var z = config.batteryLocation.z;

            // Series
            var c1 = new Capacitor({
                position: new Vector3(x, y, z),
                plateWidth: config.plateWidth,
                plateSeparation: config.plateSeparation,
                dielectricMaterial: config.dielectricMaterial,
                dielectricOffset: config.dielectricOffset
            });

            y += config.capacitorYSpacing;

            var c2 = new Capacitor({
                position: new Vector3(x, y, z),
                plateWidth: config.plateWidth,
                plateSeparation: config.plateSeparation,
                dielectricMaterial: config.dielectricMaterial,
                dielectricOffset: config.dielectricOffset
            });

            // Parallel
            x += config.capacitorXSpacing;
            var c3 = new Capacitor({
                position: new Vector3(x, y, z),
                plateWidth: config.plateWidth,
                plateSeparation: config.plateSeparation,
                dielectricMaterial: config.dielectricMaterial,
                dielectricOffset: config.dielectricOffset
            });

            this.capacitors.push(c1);
            this.capacitors.push(c2);
            this.capacitors.push(c3);
        },

        /**
         * Creates wires as shown in the diagram at the top of this file.
         */
        initWires: function(config, numberOfCapacitors) {
            var c1 = this.capacitors[0];
            var c2 = this.capacitors[1];
            var c3 = this.capacitors[2];

            this.wires.add(new BatteryToCapacitorsTopWire({
                battery: this.battery,
                capacitors: [ c1, c3 ],
                wireThickness: config.wireThickness,
                wireExtent: config.wireExtent
            }));

            this.wires.add(new CapacitorToCapacitorsWire({
                topCapacitor: c1,
                bottomCapacitors: [ c2 ],
                wireThickness: config.wireThickness,
                wireExtent: config.wireExtent
            }));

            this.wires.add(new BatteryToCapacitorsBottomWire({
                battery: this.battery,
                capacitors: [ c2, c3 ],
                wireThickness: config.wireThickness,
                wireExtent: config.wireExtent
            }));
        },

        /**
         * Updates plate voltages
         */
        updatePlateVoltages: function() {
            // Series
            var C_series = 1 / ((1 / this.c1.getTotalCapacitance()) + (1 / this.c2.getTotalCapacitance()));
            var Q_series = this.getTotalVoltage() * C_series;
            this.c1.set('platesVoltage', Q_series / this.c1.getTotalCapacitance());
            this.c2.set('platesVoltage', Q_series / this.c2.getTotalCapacitance());
            // Parallel
            this.c3.set('platesVoltage', this.getTotalVoltage());
        },

        /**
         * Gets the wire between the 2 capacitors.
         */
        getMiddleWire: function() {
            this.wires.at(1);
        },

        /**
         * Gets the total capacitance of the circuit.
         * C_total = ( 1 / ( 1/C1 + 1/C2 ) ) + C3
         */
        getTotalCapacitance: function() {
            var C1 = this.c1.getTotalCapacitance();
            var C2 = this.c2.getTotalCapacitance();
            var C3 = this.c3.getTotalCapacitance();
            return (1 / (1 / C1 + 1 / C2)) + C3;
        },

        /**
         * Gets the voltage at a point, with respect to ground.
         */
        getVoltageAt: function(point, radius) {
            var voltage = NaN;

            if (this.connectedToBatteryTop(point, radius))
                voltage = this.getTotalVoltage();
            else if (this.connectedToBatteryBottom(point, radius))
                voltage = 0;
            else if (this.connectedToC2TopPlate(point, radius))
                voltage = this.c2.get('platesVoltage');

            return voltage;
        },

        /**
         * True if circle is touching part of the circuit that is connected to
         *   the battery's top terminal.
         */
        connectedToBatteryTop: function(point, radius) {
            return
                this.battery.touchesTopTerminal(point, radius) ||
                this.getTopWire().touches(point, radius) ||
                this.c1.touchesTopPlate(point, radius) ||
                this.c3.touchesTopPlate(point, radius);
        },

        /**
         * True if circle is touching part of the circuit that is connected to
         *   the battery's bottom terminal.
         */
        connectedToBatteryBottom: function(point, radius) {
            return
                this.battery.touchesBottomTerminal(point, radius) ||
                this.getBottomWire().touches(point, radius) ||
                this.c2.touchesBottomPlate(point, radius) ||
                this.c3.touchesBottomPlate(point, radius);
        },

        /**
         * True if circle is touching part of the circuit that is connected to
         *   C2's top plate.
         */
        connectedToC2TopPlate: function(point, radius) {
            return
                this.c1.touchesBottomPlate(point, radius) ||
                this.c2.touchesTopPlate(point, radius) ||
                this.getMiddleWire().touches(point, radius);
        }

    });

    return Combination1Circuit;
});