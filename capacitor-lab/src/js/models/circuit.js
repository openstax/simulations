define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Base class for all circuits
     */
    var AbstractCircuit = Backbone.Model.extend({

        defaults: {
            // Simulates current flow.  A zero value means no flow.
            currentAmplitude: 0
        },

        initialize: function(attributes, options) {
            options = _.extend({
                config: {},
                numberOfCapacitors: 0
            }, options);

            this.previousTotalCharge = -1; // No value

            this.battery = new Battery({ position: config.batteryLocation });

            this.capacitors = [];
            this.wires = [];

            this.initCapacitors(options.config, options.numberOfCapacitors);
            this.initWires(options.config, options.numberOfCapacitors);

            this.listenTo(this.capacitors, 'capacitor-changed', this.capacitorChanged);
        },

        /**
         * Creates all the capacitors.  Should be overridden by child classes.
         */
        initCapacitors: function(config, numberOfCapacitors) {},

        /**
         * Creates all the wires.  Should be overridden by child classes.
         */
        initWires: function(config, numberOfCapacitors) {},

        /**
         * Resets the model to its original state
         */
        reset: function() {
            this.battery.reset();
            _.each(this.capacitors, function(capacitor) {
                capacitor.reset();
            });
        },

        /**
         * Updates every simulation step
         */
        update: function(time, deltaTime) {
            this.updateCurrentAmplitude(time, deltaTime);
        },

        /**
         * Updates the current amplitude, which is proportional to dQ/dt.
         */
        updateCurrentAmplitude: function(time, deltaTime) {
            var Q = this.getTotalCharge();
            if (this.previousTotalCharge !== -1) {
                var dQ = Q - this.previousTotalCharge;
                var amplitude = dQ / deltaTime;
                this.set('currentAmplitude', amplitude);
            }
            this.previousTotalCharge = Q;
        },

        /**
         * Updates plate voltages
         */
        updatePlateVoltages: function() {},

        /**
         * Responds to any capacitor-changed events
         */
        capacitorChanged: function() {
            this.updatePlateVoltages();
            this.trigger('circuit-changed');
        },

        /**
         * Default implementation has a connected battery. In the "single capacitor"
         *   circuit, we'll override this and add a setter, so that the battery can
         *   be dynamically connected and disconnected in the "Dielectric" module.
         */
        batteryIsConnected: function() {
            return true;
        },

        /**
         * Gets the wire connected to the battery's top terminal
         */
        getTopWire: function() {
            return this.wires[0];
        },

        /**
         * Gets the wire connected to the battery's bottom terminal
         */
        getBottomWire: function() {
            return this.wires[this.wires.length - 1];
        },

        /**
         * Gets the total charge in the circuit.
         */
        getTotalCharge: function() {
            return this.getTotalVoltage() * this.getTotalCapacitance();
        },

        /**
         * Gets the total voltage seen by the capacitors.
         */
        getTotalVoltage: function() {
            return this.battery.get('voltage');
        },

        /**
         * Gets the total capacitance of the circuit.
         */
        getTotalCapacitance: function() {},

        /**
         * Gets the energy stored in the circuit in Joules.
         */
        getStoredEnergy: function() {
            var totalCapacitance = this.getTotalCapacitance(); // F
            var totalVoltage = this.getTotalVoltage();         // V
            return 0.5 * totalCapacitance * totalVoltage * totalVoltage; // Joules
        },

        /**
         * Gets the voltage between 2 Shapes. The shapes are in world coordinates.
         * Returns Double.NaN if the 2 Shapes are not both connected to the circuit
         */
        getVoltageBetween: function(positiveShape, negativeShape) {
            return this.getVoltageAt(positiveShape) - this.getVoltageAt(negativeShape);
        },

        /**
         * Gets the voltage at a shape, with respect to ground.
         * Returns Double.NaN if the Shape is not connected to the circuit
         */
        getVoltageAt: function(shape) {},

        /**
         * Gets the effective E-field at a specified location.
         * Inside the plates, this is E_effective.
         * Outside the plates, it is zero.
         */
        getEffectiveEFieldAt: function(location) {
            var eField = 0;
            for (var i = 0; i < this.capacitors.length; i++)
                if (this.capacitors[i].isBetweenPlates(location)) {
                    eField = this.capacitors[i].getEffectiveEField();
                    break;
                }
            }
            return eField;
        },

        /**
         * Field due to the plate, at a specific location.
         * Between the plates, the field is either E_plate_dielectric or E_plate_air, 
         *   depending on whether the probe intersects the dielectric.
         * Outside the plates, the field is zero.
         */
        getPlatesDielectricEFieldAt: function(location) {
            var eField = 0;
            for (var i = 0; i < this.capacitors.length; i++)
                if (this.capacitors[i].isInsideDielectricBetweenPlates(location)) {
                    eField = this.capacitors[i].getPlatesDielectricEField();
                    break;
                }
                else if (this.capacitors[i].isInsideAirBetweenPlates(location)) {
                    eField = this.capacitors[i].getPlatesAirEField();
                    break;
                }
            }
            return eField;
        },

        /**
         * Gets the field due to dielectric polarization, at a specific location.
         * Between the plates, the field is either E_dielectric or E_air, depending
         *   on whether the probe intersects the dielectric.
         * Outside the plates, the field is zero.
         */
        getDielectricEFieldAt: function(location) {
            var eField = 0;
            for (var i = 0; i < this.capacitors.length; i++)
                if (this.capacitors[i].isInsideDielectricBetweenPlates(location)) {
                    eField = this.capacitors[i].getDielectricEField();
                    break;
                }
                else if (this.capacitors[i].isInsideAirBetweenPlates(location)) {
                    eField = this.capacitors[i].getAirEField();
                    break;
                }
            }
            return eField;
        },

    });

    return AbstractCircuit;
});