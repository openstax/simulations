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

            this.initShape(this.getDirectionVector().length(), this.get('thickness'));
        },

        updateShape: function() {
            var height = this.get('thickness') * Constants.SAT_SCALE;
            var length = this.getDirectionVector().length() * Constants.SAT_SCALE;

            this.shape.points[0].x = 0;
            this.shape.points[0].y = -height / 2;
            this.shape.points[1].x = length;
            this.shape.points[1].y = -height / 2;
            this.shape.points[2].x = length;
            this.shape.points[2].y = height / 2;
            this.shape.points[3].x = 0 
            this.shape.points[3].y = height / 2;

            this.shape.setPoints(this.shape.points);

            Branch.prototype.updateShape.apply(this, arguments);
        },

    }, Constants.Wire);

    return Wire;
});