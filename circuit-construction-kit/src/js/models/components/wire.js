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
            var height = this.get('thickness');
            var length = this.getDirectionVector().length();
            var x = this.getStartPoint().x;
            var y = this.getStartPoint().y;

            this.shape.points[0].x = x ;
            this.shape.points[0].y = y - height / 2;
            this.shape.points[1].x = x + length;
            this.shape.points[1].y = y - height / 2;
            this.shape.points[2].x = x + length;
            this.shape.points[2].y = y + height / 2;
            this.shape.points[3].x = x;
            this.shape.points[3].y = y + height / 2;

            this.shape.setPoints(this.shape.points);

            Branch.prototype.updateShape.apply(this, arguments);
        },

    }, Constants.Wire);

    return Wire;
});