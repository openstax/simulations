define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Rectangle = require('common/math/rectangle');

    /**
     * 
     */
    var Shape = function() {
        this._bounds = new Rectangle();
    };

    /**
     * Instance functions/properties
     */
    _.extend(Shape.prototype, {

        /**
         * Rotates the shape
         */
        rotate: function(radians) {},

        /**
         * Compute the intersections of the specified ray with this polygon's edges
         */
        getIntersections: function(tail, direction) {},

        /**
         * Returns a rectangle representing the bounds of the shape
         */
        getBounds: function() {},

        /**
         * Returns the point that will be used to place the rotation drag handle (or null
         *   if not rotatable, like for circles)
         */
        getReferencePoint: function() {},

        /**
         * Returns whether the shape contains a given point
         */
        contains: function(point) {},

        /**
         * Clones this shape instance and returns it
         */
        clone: function() {}

    });

    return Shape;
});
