define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Shape = require('models/polygon');

    /**
     * 
     */
    var Polygon = function(points, referencePointIndex) {
        Shape.apply(this, arguments);

        this.points = points;
        this.referencePointIndex = referencePointIndex;
        this.piecewiseCurve = PiecewiseCurve.fromPoints(options.points);
    };

    /**
     * Instance functions/properties
     */
    _.extend(Polygon.prototype, Shape.prototype, {

        /**
         * Translates the shape
         */
        translate: function(dx, dy) {},

        /**
         * Rotates the shape
         */
        rotate: function(radians) {},

        /**
         * Compute the intersections of the specified ray with this polygon's edges
         */
        getIntersections: function(ray) {},

        /**
         * Returns a rectangle representing the bounds of the shape
         */
        getBounds: function() {
            return this._bounds.set(this.piecewiseCurve.getBounds());
        },

        /**
         * Returns the point that will be used to place the rotation drag handle (or null
         *   if not rotatable, like for circles)
         */
        getReferencePoint: function() {},

        /**
         * Returns whether the shape contains a given point
         */
        contains: function(point) {}

    });

    return Polygon;
});
