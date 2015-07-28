define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var ParallelCircuit = require('models/circuit/parallel');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Model of a circuit with a battery (B) connected to a single capacitor (C1).
     *   This is treated as a special case of a parallel circuit, with some added
     *   features that are specific to "Dielectric" module.
     * 
     *   |-----|
     *   |     |
     *   B    C1
     *   |     |
     *   |-----|
     * 
     * Unlike other circuits in this simulation, the battery can be disconnected.
     * When the battery is disconnected, plate charge can be controlled directly.
     */
    var SingleCircuit = ParallelCircuit.extend({

        defaults: _.extend({}, ParallelCircuit.prototype.defaults, {
            // Whether or not the battery is connected
            batteryConnected: true,

            // Charge set manually by the user, used when battery is disconnected
            disconnectedPlateCharge: 0
        }),

        initialize: function(attributes, options) {
            options = _.extend({
                numberOfCapacitors: 1
            }, options);

            ParallelCircuit.prototype.initialize.apply(this, [attributes, options]);

            // Save a reference to the first and only capacitor for convenience
            this.capacitor = this.capacitors.first();

            // Set default disconnected plate charge
            this.set('disconnectedPlateCharge', this.getTotalCharge());
            
            // Bind event listeners
            this.on('change:batteryConnected', function() {
                this.set('disconnectedPlateCharge', this.getTotalCharge());
                this.updatePlateVoltages();
                this.trigger('circuit-changed');
            });

            this.on('change:disconnectedPlateCharge', function() {
                if (!this.get('batteryConnected')) {
                    this.updatePlateVoltages();
                    this.trigger('circuit-change');
                }
            });
        },

        /**
         * Updates the plate voltage, depending on whether the battery is connected.
         *   Null check required because superclass calls this method from its
         *   constructor.  Remember to call this method at the end of this class'
         *   constructor.
         */
        updatePlateVoltages: function() {
            if (!this.capacitor)
                return;

            var v = this.battery.get('voltage');

            if (!this.get('batteryConnected')) {
                // V = Q / C
                v = this.get('disconnectedPlateCharge') / this.capacitor.getTotalCapacitance();
            }

            this.capacitor.set('platesVoltage', v);
        },

        /*
         * Normally the total voltage is equivalent to the battery voltage, but
         *   disconnecting the battery changes how we compute total voltage, so
         *   override this method.
         */
        getTotalVoltage: function() {
            if (this.get('batteryConnected'))
                return ParallelCircuit.prototype.getTotalVoltage.apply(this, arguments);
            else
                return this.capacitor.get('platesVoltage');
        },

        /**
         * Gets the voltage at a certain circuit component, with respect to ground.
         *   Returns NaN if the component is not connected to the circuit.
         */
        getVoltageAt: function(component, touchesTopPart) {
            var voltage = NaN;

            if (this.get('batteryConnected')) {
                voltage = ParallelCircuit.prototype.getVoltageAt.apply(this, arguments);
            }
            else if (component instanceof Capacitor) {
                if (touchesTopPart)
                    voltage = this.getTotalVoltage();
                else
                    voltage = 0;
            }
            
            return voltage;
        },

        /**
         * Gets the total charge in the circuit.  Overrides AbstractCircuit's
         */
        getTotalCharge: function() {
            return this.capacitor.getTotalPlateCharge();
        },

        connectBattery: function() {
            this.set('batteryConnected', true);
        },

        disconnectBattery: function() {
            this.set('batteryConnected', false);
        }

    });

    return SingleCircuit;
});