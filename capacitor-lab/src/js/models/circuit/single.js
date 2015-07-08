define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var ParallelCircuit = require('models/circuit/abstract');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Base class for all circuits
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

            // Set default disconnected plate charge
            this.set('disconnectedPlateCharge', this.getTotalCharge());

            // Save a reference to the first and only capacitor for convenience
            this.capacitor = this.capacitors[0];

            // Bind event listeners
            this.on('change:batteryConnected', function() {
                this.updatePlateVoltages();
                this.disconnectedPlateCharge = this.getTotalCharge();
                this.trigger('circuit-changed');
            });

            this.on('change:disconnectedPlateCharge', function() {
                if (!this.batteryIsConnected()) {
                    this.updatePlateVoltages();
                    this.trigger('circuit-change');
                }
            })
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
         * Updates the plate voltage, depending on whether the battery is connected.
         *   Null check required because superclass calls this method from its
         *   constructor.  Remember to call this method at the end of this class'
         *   constructor.
         */
        updatePlateVoltages: function() {
            var v = this.battery.getVoltage();

            if (!this.batteryIsConnected()) {
                // V = Q / C
                v = this.disconnectedPlateCharge / this.capacitor.getTotalCapacitance();
            }

            this.capacitor.setPlatesVoltage(v);
        },

        /*
         * Normally the total voltage is equivalent to the battery voltage, but
         *   disconnecting the battery changes how we compute total voltage, so
         *   override this method.
         */
        getTotalVoltage: function() {
            if (this.batteryIsConnected())
                return ParallelCircuit.prototype.getTotalVoltage.apply(this, arguments);
            else
                return this.capacitor.getPlatesVoltage();
        },

        /**
         * Gets the voltage at a shape, with respect to ground.
         * Returns Double.NaN if the Shape is not connected to the circuit
         */
        getVoltageAt: function(shape) {
            var voltage = NaN;
            if (this.batteryIsConnected()) {
                voltage = ParallelCircuit.prototype.getVoltageAt.apply(this, arguments);
            }
            else {
                if (this.intersectsSomeTopPlate(shape))
                    voltage = this.getTotalVoltage();
                else if (this.intersectsSomeBottomPlate(shape))
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

    });

    return SingleCircuit;
});