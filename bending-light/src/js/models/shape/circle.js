define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PiecewiseCurve   = require('common/math/piecewise-curve');
    var LineIntersection = require('common/math/line-intersection');
    var Vector2          = require('common/math/vector2');

    var Shape        = require('models/shape');
    var Intersection = require('models/intersection');

    /**
     * 
     */
    var Circle = function(radius) {
        Shape.apply(this, arguments);

        this.radius = radius;
        this.center = new Vector2();

        this._vec = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(Circle.prototype, Shape.prototype, {

        /**
         * Translates the shape
         */
        translate: function(dx, dy) {
            this.center.add(dx, dy);
        },

        /**
         * Returns a piecewise curve approximation of a circle.
         *
         * Algorithm from http://journal.missiondata.com/post/63399320412/approximating-a-circle-with-a-polygon
         */
        toPiecewiseCurve: function() {
            var numPoints = 48; // Increase this to get a higher-quality circle
            var radius = this.radius;
            var points = [];

            for (var i = 0; i < numPoints; i++) {
                var theta = Math.PI * (i / (numPoints / 2));
                points.push(new Vector2(
                    this.center.x + radius * Math.cos(theta),
                    this.center.y + radius * Math.sin(theta)
                ));
            }

            return PiecewiseCurve.fromPoints(points, false);
        },

        /**
         * Compute the intersections of the specified ray with the circle
         */
        getIntersections: function(tail, direction) {
            // Find the intersections between the infinite ray's line (not a segment) and the circle
            var points = LineIntersection.lineCircleIntersection(
                tail.x, 
                tail.y, 
                tail.x + direction.x, 
                tail.y + direction.y, 
                this.center.x, 
                this.center.y, 
                this.radius
            );

            // Create Intersection instances from the returned points
            var intersections = [];
            for (var i = 0; i < points.length; i++) {
                // Filter out null results, which are returned if there is no intersection
                if (points[i] !== null) {
                    var vector = this._vec.set(points[i]).sub(tail);

                    //Only consider intersections that are in front of the ray
                    if (vector.dot(direction) > 0) {
                        var normalVector = this._vec.set(points[i]).normalize();
                        if (normalVector.dot(direction) > 0)
                            normalVector = normalVector.negate();
                        intersections.push(Intersection.create(normalVector, points[i]));
                    }
                }
            }
            return intersections;
        },

        /**
         * Returns a rectangle representing the bounds of the shape
         */
        getBounds: function() {
            return this._bounds.set(-radius, -radius, radius * 2, radius * 2);
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
        contains: function(point) {
            return point.distance(this.center) <= this.radius;
        },

        /**
         * Clones this shape instance and returns it
         */
        clone: function() {
            var circle = new Circle(this.radius);
            circle.center.x = this.center.x;
            circle.center.y = this.center.y;
            return circle;
        }

    });

    return Circle;
});
