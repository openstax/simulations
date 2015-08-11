define(function (require) {

    'use strict';

    var Vector3 = require('common/math/vector3');

    var AbstractCircuit               = require('models/circuit');
    var Capacitor                     = require('models/capacitor');
    var BatteryToCapacitorsTopWire    = require('models/wire/battery-to-capacitors-top');
    var BatteryToCapacitorsBottomWire = require('models/wire/battery-to-capacitors-bottom');
    var CapacitorToCapacitorsWire     = require('models/wire/capacitor-to-capacitors');

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

            this.c1 = this.capacitors.at(0);
            this.c2 = this.capacitors.at(1);
            this.c3 = this.capacitors.at(2);

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

            this.capacitors.add(c1);
            this.capacitors.add(c2);
            this.capacitors.add(c3);
        },

        /**
         * Creates wires as shown in the diagram at the top of this file.
         */
        initWires: function(config, numberOfCapacitors) {
            var c1 = this.capacitors.at(0);
            var c2 = this.capacitors.at(1);
            var c3 = this.capacitors.at(2);

            this.wires.add(new BatteryToCapacitorsTopWire({
                thickness: config.wireThickness
            },{
                battery: this.battery,
                capacitors: [ c1, c3 ],
                wireExtent: config.wireExtent
            }));

            this.wires.add(new CapacitorToCapacitorsWire({
                thickness: config.wireThickness
            },{
                topCapacitor: c1,
                bottomCapacitors: [ c2 ],
                wireExtent: config.wireExtent
            }));

            this.wires.add(new BatteryToCapacitorsBottomWire({
                thickness: config.wireThickness
            },{
                battery: this.battery,
                capacitors: [ c2, c3 ],
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
            return this.wires.at(1);
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
         * Gets the voltage at a certain circuit component, with respect to ground.
         *   Returns NaN if the component is not connected to the circuit.
         */
        getVoltageAt: function(component, touchesTopPart) {
            var voltage = NaN;

            if (this.connectedToBatteryTop(component, touchesTopPart))
                voltage = this.getTotalVoltage();
            else if (this.connectedToBatteryBottom(component, touchesTopPart))
                voltage = 0;
            else if (this.connectedToC2TopPlate(component, touchesTopPart))
                voltage = this.c2.get('platesVoltage');

            return voltage;
        },

        /**
         * True if component is on part of the circuit that is connected to
         *   the battery's top terminal.
         */
        connectedToBatteryTop: function(component, touchesTopPart) {
            if (component === this.battery) {
                if (touchesTopPart)
                    return true;
                else
                    return false;
            }

            return (component === this.getTopWire())      ||
                (component === this.c1 && touchesTopPart) ||
                (component === this.c3 && touchesTopPart);
        },

        /**
         * True if component is on part of the circuit that is connected to
         *   the battery's bottom terminal.
         */
        connectedToBatteryBottom: function(component, touchesTopPart) {
            if (component === this.battery) {
                if (touchesTopPart)
                    return false;
                else
                    return true;
            }

            return (component === this.getBottomWire())    ||
                (component === this.c2 && !touchesTopPart) ||
                (component === this.c3 && !touchesTopPart);
        },

        /**
         * True if component is on part of the circuit that is connected to
         *   C2's top plate.
         */
        connectedToC2TopPlate: function(component, touchesTopPart) {
            return (component === this.getMiddleWire())    ||
                (component === this.c1 && !touchesTopPart) ||
                (component === this.c2 &&  touchesTopPart);
        }

    });

    return Combination1Circuit;
});