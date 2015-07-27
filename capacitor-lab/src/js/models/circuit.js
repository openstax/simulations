define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var Battery = require('models/battery');

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
            currentAmplitude: 0,

            // The model-view transform, used for calculating interactions
            //   between objects that happen in 3D (view) space.
            mvt: null
        },

        initialize: function(attributes, options) {
            options = _.extend({
                config: {},
                numberOfCapacitors: 0
            }, options);

            this.previousTotalCharge = -1; // No value

            this.battery = new Battery({ position: options.config.batteryLocation });

            this.capacitors = new Backbone.Collection();
            this.wires = new Backbone.Collection();

            this.initCapacitors(options.config, options.numberOfCapacitors);
            this.initWires(options.config, options.numberOfCapacitors);

            this.listenTo(this.capacitors, 'change', this.capacitorChanged);
            this.on('change:mvt', this.mvtChanged);

            /*
             * When the battery voltage changes, update the plate voltages.
             *   Do NOT automatically do this when adding the observer because
             *   updatePlateVoltages is implemented by the subclass, and all
             *   necessary fields in the subclass may not be initialized.
             */
             this.listenTo(this.battery, 'change:voltage', this.updatePlateVoltages);
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
         * Updates everything dependent on the mvt
         */
        mvtChanged: function(capacitor, mvt) {
            var i;
            for (i = 0; i < this.capacitors.length; i++)
                this.capacitors.at(i).set('mvt', mvt);
            for (i = 0; i < this.wires.length; i++)
                this.wires.at(i).set('mvt', mvt);
            this.battery.set('mvt', mvt);
        },

        /**
         * Responds to any capacitor-changed events
         */
        capacitorChanged: function() {
            this.updatePlateVoltages();
            this.trigger('circuit-changed');
        },

        /**
         * Gets the wire connected to the battery's top terminal
         */
        getTopWire: function() {
            return this.wires.first();
        },

        /**
         * Gets the wire connected to the battery's bottom terminal
         */
        getBottomWire: function() {
            return this.wires.last();
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
         * Gets the voltage at a certain circuit component, with respect to ground.
         *   Returns NaN if the component is not connected to the circuit.
         */
        getVoltageAt: function(component, intersectsWithTopPlate) {},

        /**
         * Gets the effective E-field at a specified location.
         * Inside the plates, this is E_effective.
         * Outside the plates, it is zero.
         */
        getEffectiveEFieldAt: function(capacitor) {
            if (capacitor)
                return capacitor.getEffectiveEField();
            return 0;
        },

        /**
         * Field due to the plate, at a specific location.
         * Between the plates, the field is either E_plate_dielectric or E_plate_air, 
         *   depending on whether the probe intersects the dielectric.
         * Outside the plates, the field is zero.
         */
        getPlatesDielectricEFieldAt: function(capacitor, insideDielectric) {
            var eField = 0;

            if (capacitor) {
                if (insideDielectric)
                    eField = capacitor.getPlatesDielectricEField();
                else
                    eField = capacitor.getPlatesAirEField()
            }

            return eField;
        },

        /**
         * Gets the field due to dielectric polarization, at a specific location.
         * Between the plates, the field is either E_dielectric or E_air, depending
         *   on whether the probe intersects the dielectric.
         * Outside the plates, the field is zero.
         */
        getDielectricEFieldAt: function(capacitor, insideDielectric) {
            var eField = 0;

            if (capacitor) {
                if (insideDielectric)
                    eField = capacitor.getDielectricEField();
                else
                    eField = capacitor.getAirEField()
            }

            return eField;
        },

    });

    return AbstractCircuit;
});