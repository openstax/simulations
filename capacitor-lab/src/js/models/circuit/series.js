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
     ** Model of a circuit with a battery (B) and N capacitors (C1...Cn) in series.
     * 
     *    |-----|
     *    |     |
     *    |    C1
     *    |     |
     *    B    C2
     *    |     |
     *    |    C3
     *    |     |
     *    |-----|
     *
     */
    var SeriesCircuit = AbstractCircuit.extend({

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
            var y = config.batteryLocation.y - ((numberOfCapacitors / 2) * config.capacitorYSpacing);
            if (numberOfCapacitors % 2 === 0) {
                // We have an even number of capacitors, shift up
                y += (0.5 * config.capacitorYSpacing);
            }
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

                y += config.capacitorYSpacing;
            }
        },

        /**
         * Creates wires as shown in the diagram at the top of this file.
         */
        initWires: function(config, numberOfCapacitors) {
            var capacitors = this.capacitors;

            this.wires.add(new BatteryToCapacitorsTopWire({
                battery: this.battery,
                capacitors: [ capacitors[0] ],
                wireThickness: config.wireThickness,
                wireExtent: config.wireExtent
            }));

            for (var i = 0; i < capacitors.length - 1; i++) {
                this.wires.add(new CapacitorToCapacitorsWire({
                    topCapacitor: capacitors[i],
                    bottomCapacitors: [ capacitors[i + 1] ],
                    wireThickness: config.wireThickness,
                    wireExtent: config.wireExtent
                }));
            }

            this.wires.add(new BatteryToCapacitorsBottomWire({
                battery: this.battery,
                capacitors: [ capacitors[0] ],
                wireThickness: config.wireThickness,
                wireExtent: config.wireExtent
            }));
        },

        /**
         * Updates plate voltages
         */
        updatePlateVoltages: function() {
            var Q_total = this.getTotalCharge();
            for (var i = 0; i < this.capacitors.length; i++) {
                var Ci = this.capacitors[i].getTotalCapacitance();
                var Vi = Q_total / Ci;
                this.capacitors[i].set('platesVoltage', Vi);
            }
        },

        /**
         * Gets the total capacitance of the circuit.
         * C_total = 1 / ( 1/C1 + 1/C2 + ... + 1/Cn)
         */
        getTotalCapacitance: function() {
            var sum = 0;
            for (var i = 0; i < this.capacitors.length; i++)
                sum += 1 / this.capacitors[i].getTotalCapacitance();
            return 1 / sum;
        },

        /**
         * Gets the voltage at a point, with respect to ground.
         */
        getVoltageAt: function(point, radius) {
            var voltage = NaN;

            // Check the battery
            if (this.battery.touchesTopTerminal(point, radius)) {
                voltage = this.getTotalVoltage();
            }
            else if (this.battery.touchesBottomTerminal(point, radius)) {
                voltage = 0;
            }
            else {
                // Check the plates and wires
                var capacitor;
                for (var i = 0; i < this.capacitors.length; i++) {
                    capacitor = this.capacitors[i];

                    var topWire    = this.wires.at(i);
                    var bottomWire = this.wires.at(i + 1);

                    if (capacitor.touchesTopPlate(point, radius) || topWire.touches(point, radius)) {
                        // Touches top plate or wire, so sum voltage of this capacitor
                        //   and all capacitors below it.
                        voltage = this.sumPlateVoltages(i);
                    }
                    else if (capacitor.touchesbottomPlate(point, radius) || bottomWire.touches(point, radius)) {
                        // Touches bottom plate or wire, sum voltage of all capacitors
                        //   below this one.
                        voltage = this.sumPlateVoltages(i + 1);
                    }
                }
            }

            return voltage;
        },

        /**
         * Sums the plate voltages for all capacitors between some top plate and ground.
         *   Assumes that capacitors are ordered as shown in the javadoc diagram.
         */
        sumPlateVoltages: function(topPlateIndex) {
            var voltage = 0;
            for (var i = topPlateIndex; i < this.capacitors.length; i++)
                voltage += this.capacitors[i].get('platesVoltage');
            return voltage;
        }

    });

    return SeriesCircuit;
});