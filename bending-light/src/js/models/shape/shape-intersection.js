define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Shape        = require('models/shape');
    var Intersection = require('models/intersection');

    /**
     * Creates a shape that is the intersection of two shapes.
     *
     * CSG intro: https://secure.wikimedia.org/wikipedia/en/wiki/Constructive_solid_geometry
     * Rationale for intersection: http://groups.csail.mit.edu/graphics/classes/6.838/F01/lectures/SmoothSurfaces/0the_s040.html
     *
     * Note to self: TODO: when drawing these, it can actually be really
     *   easy if the second shape is just used as a mask, because it is
     *   the intersection of the two.
     */
    var ShapeIntersection = function(a, b) {
        Shape.apply(this, arguments);

        this.a = a;
        this.b = b;
    };

    /**
     * Instance functions/properties
     */
    _.extend(ShapeIntersection.prototype, Shape.prototype, {

        /**
         * Rotates the shape
         */
        rotate: function(radians) {
            this.a.rotate(radians);
            this.b.rotate(radians);
        },

        /**
         * Compute the intersections of the specified ray
         */
        getIntersections: function(tail, direction) {
            var i;
            var a = this.a;
            var b = this.b;

            // For CSG intersection, intersection points need to be at the boundary
            //   of one surface, and INSIDE the other. If it was outside one of the
            //   shapes, it would not be in the intersection
            var result = [];

            // find all intersections with A that are in B
            var intersectionsWithA = a.getIntersections(tail, direction);
            for (i = 0; i < intersectionsWithA.length; i++) {
                if (b.contains(intersectionsWithA[i].getPoint()))
                    result.push(intersectionsWithA[i]);
            }

            // find all intersections with B that are in A
            var intersectionsWithB = b.getIntersections(tail, direction);
            for (i = 0; i < intersectionsWithB.length; i++) {
                if (a.contains(intersectionsWithB[i].getPoint()))
                    result.push(intersectionsWithB[i]);
            }

            return result;
        },

        /**
         * Returns a rectangle representing the bounds of the shape
         */
        getBounds: function() {
            throw 'Not yet implemented';
        },

        /**
         * Returns the point that will be used to place the rotation drag handle (or null
         *   if not rotatable, like for circles)
         */
        getReferencePoint: function() {
            // Return the first viable reference point
            if (this.a.getReferencePoint())
                return this.a.getReferencePoint();
            else
                return this.b.getReferencePoint();
        },

        /**
         * Returns whether the shape contains a given point
         */
        contains: function(point) {
            return this.a.contains(point) && this.b.contains(point);
        },
        
        /**
         * Clones this shape instance and returns it
         */
        clone: function() {
            return new ShapeIntersection(this.a.clone(), this.b.clone());
        }

    });

    return ShapeIntersection;
});
