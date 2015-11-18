define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Branch = require('models/branch');

    var Constants = require('constants');

    /**
     * A wire
     */
    var Wire = Branch.extend({

        defaults: _.extend({}, Branch.prototype.defaults, {
            thickness: Constants.Wire.LIFELIKE_THICKNESS
        }),

        initialize: function(attributes, options) {
            Branch.prototype.initialize.apply(this, [attributes, options]);
        }

    }, Constants.Wire);

    return Wire;
});