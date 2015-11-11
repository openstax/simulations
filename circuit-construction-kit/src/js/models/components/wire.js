define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Branch = require('models/branch');

    var Constants = require('constants');
    var LIFELIKE_THICKNESS  = Constants.WIRE_THICKNESS * Constants.DEFAULT_SCALE;
    var SCHEMATIC_THICKNESS = Constants.WIRE_THICKNESS * Constants.DEFAULT_SCALE * 0.6;

    /**
     * A wire
     */
    var Wire = Branch.extend({

        defaults: _.extend({}, Branch.prototype.defaults, {
            thickness: LIFELIKE_THICKNESS
        }),

        initialize: function(attributes, options) {
            Branch.prototype.initialize.apply(this, [attributes, options]);
        }

    });

    return Wire;
});