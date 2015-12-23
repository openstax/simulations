define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CircuitComponent = require('models/components/circuit-component');

    var Constants = require('constants');
    
    /**
     * An inductor
     */
    var Inductor = CircuitComponent.extend({

        defaults: _.extend({}, CircuitComponent.prototype.defaults, {
            inductance: Constants.Inductor.DEFAULT_INDUCTANCE,
            length: 1,
            height: 1
        }),

        initialize: function(attributes, options) {
            CircuitComponent.prototype.initialize.apply(this, [attributes, options]);
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

    }, Constants.Inductor);

    return Inductor;
});