define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CircuitComponent = require('models/components/circuit-component');

    var Constants = require('constants');
    
    /**
     * A capacitor
     */
    var Capacitor = CircuitComponent.extend({

        defaults: _.extend({}, CircuitComponent.prototype.defaults, {
            capacitance: Constants.Capacitor.DEFAULT_CAPACITANCE,
            length: 1,
            height: 1
        }),

        initialize: function(attributes, options) {
            CircuitComponent.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Set the capacitance and keep the charge constant.  That means that
         * the voltage will need to be changed accordingly.
         */
        setCapacitanceConstantCharge: function(capacitance) {
            var q = this.getCharge();
            this.set('capacitance', capacitance);
            this.set('voltageDrop', q / capacitance);
        },

        getCharge: function() {
            return this.get('capacitance') * this.get('voltageDrop');
        },

        resetDynamics: function() {
            this.set('kirkhoffEnabled', false);
            this.set({
                voltageDrop: 0,
                current: 0,
                mnaCurrent: 0,
                mnaVoltageDrop: 0
            });
            this.set('kirkhoffEnabled', true);
        },

        discharge: function() {
            this.resetDynamics();
        }

    }, Constants.Capacitor);

    return Capacitor;
});