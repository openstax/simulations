define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PiecewiseCurve   = require('common/math/piecewise-curve');
    var LineIntersection = require('common/math/line-intersection');
    var Vector2          = require('common/math/vector2');

    var Shape        = require('models/polygon');
    var Intersection = require('models/intersection');

    /**
     * 
     */
    var Circle = function() {
        Shape.apply(this, arguments);

        this.radius = radius;
    };

    /**
     * Instance functions/properties
     */
    _.extend(Circle.prototype, Shape.prototype, {

        /**
         * Compute the intersections of the specified ray with this polygon's edges
         */
        getIntersections: function(tail, direction) {
            
        },

        /**
         * Returns a rectangle representing the bounds of the shape
         */
        getBounds: function() {
            
        },

        /**
         * Returns the point that will be used to place the rotation drag handle (or null
         *   if not rotatable, like for circles)
         */
        getReferencePoint: function() {
            return null;
        },

        /**
         * Returns whether the shape contains a given point
         */
        contains: function(point) {}

    });

    return Circle;
});
