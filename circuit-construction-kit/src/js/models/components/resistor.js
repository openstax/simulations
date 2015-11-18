define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CircuitComponent = require('models/components/circuit-component');

    /**
     * A resistor
     */
    var Resistor = CircuitComponent.extend({

        defaults: _.extend({}, CircuitComponent.prototype.defaults, {
            resistance: 10,
            kirkhoffEnabled: true,
            length: 1,
            height: 1
        }),

        initialize: function(attributes, options) {
            CircuitComponent.prototype.initialize.apply(this, [attributes, options]);
        }

    });

    return Resistor;
});