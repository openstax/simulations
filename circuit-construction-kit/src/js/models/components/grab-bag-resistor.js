define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Resistor = require('models/components/resistor');

    /**
     * A resistor
     */
    var GrabBagResistor = Resistor.extend({

        defaults: _.extend({}, Resistor.prototype.defaults, {
            grabBagItem: undefined
        }),

        initialize: function(attributes, options) {
            Resistor.prototype.initialize.apply(this, [attributes, options]);
        }

    });

    return GrabBagResistor;
});