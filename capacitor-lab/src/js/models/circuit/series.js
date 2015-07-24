define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');
    var Vector3 = require('common/math/vector3');

    var AbstractCircuit               = require('models/circuit');
    var Capacitor                     = require('models/capacitor');
    var BatteryToCapacitorsTopWire    = require('models/wire/battery-to-capacitors-top');
    var BatteryToCapacitorsBottomWire = require('models/wire/battery-to-capacitors-bottom');
    var CapacitorToCapacitorsWire     = require('models/wire/capacitor-to-capacitors');

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
            //if (numberOfCapacitors % 2 === 0) {
                // We have an even number of capacitors, shift up
                y += (0.5 * config.capacitorYSpacing);
            //}
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

                y += config.capacitorYSpacing;
            }
        },

        /**
         * Creates wires as shown in the diagram at the top of this file.
         */
        initWires: function(config, numberOfCapacitors) {
            var capacitors = this.capacitors;

            this.wires.add(new BatteryToCapacitorsTopWire({
                thickness: config.wireThickness
            },{
                battery: this.battery,
                capacitors: [ capacitors.first() ],
                wireExtent: config.wireExtent
            }));

            for (var i = 0; i < capacitors.length - 1; i++) {
                this.wires.add(new CapacitorToCapacitorsWire({
                    thickness: config.wireThickness
                },{
                    topCapacitor: capacitors.at(i),
                    bottomCapacitors: [ capacitors.at(i + 1) ],
                    wireExtent: config.wireExtent
                }));
            }

            this.wires.add(new BatteryToCapacitorsBottomWire({
                thickness: config.wireThickness
            },{
                battery: this.battery,
                capacitors: [ capacitors.last() ],
                wireExtent: config.wireExtent
            }));
        },

        /**
         * Updates plate voltages
         */
        updatePlateVoltages: function() {
            var Q_total = this.getTotalCharge();
            for (var i = 0; i < this.capacitors.length; i++) {
                var Ci = this.capacitors.at(i).getTotalCapacitance();
                var Vi = Q_total / Ci;
                this.capacitors.at(i).set('platesVoltage', Vi);
            }
        },

        /**
         * Gets the total capacitance of the circuit.
         * C_total = 1 / ( 1/C1 + 1/C2 + ... + 1/Cn)
         */
        getTotalCapacitance: function() {
            var sum = 0;
            for (var i = 0; i < this.capacitors.length; i++)
                sum += 1 / this.capacitors.at(i).getTotalCapacitance();
            return 1 / sum;
        },

        /**
         * Gets the voltage at a certain circuit component, with respect to ground.
         *   Returns NaN if the component is not connected to the circuit.
         */
        getVoltageAt: function(component, touchesTopPart) {
            var voltage = NaN;

            // Check the battery
            if (component === this.battery) {
                if (touchesTopPart)
                    voltage = this.getTotalVoltage();
                else
                    voltage = 0;
            }
            else {
                // Check the plates and wires
                var capacitor;
                for (var i = 0; i < this.capacitors.length; i++) {
                    capacitor = this.capacitors.at(i);

                    var topWire    = this.wires.at(i);
                    var bottomWire = this.wires.at(i + 1);

                    if ((component === capacitor && touchesTopPart) || component === topWire) {
                        // Touches top plate or wire, so sum voltage of this capacitor
                        //   and all capacitors below it.
                        voltage = this.sumPlateVoltages(i);
                    }
                    else if ((component === capacitor && !touchesTopPart) || component === bottomWire) {
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
                voltage += this.capacitors.at(i).get('platesVoltage');
            return voltage;
        }

    });

    return SeriesCircuit;
});