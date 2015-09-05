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
    var Polygon = function(points, referencePointIndex) {
        Shape.apply(this, arguments);

        this.referencePointIndex = referencePointIndex;
        this.piecewiseCurve = PiecewiseCurve.fromPoints(points);

        this._normal1 = new Vector2();
        this._normal2 = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(Polygon.prototype, Shape.prototype, {

        /**
         * Rotates the shape
         */
        rotate: function(radians) {
            this.piecewiseCurve.rotate(radians);
        },

        /**
         * Compute the intersections of the specified ray with this polygon's edges
         */
        getIntersections: function(tail, direction) {
            var intersections = [];
            var edges = this.getEdges();
            for (var i = 0; i < edges.length; i++) {
                // Get the intersection if there is one
                var intersection = LineIntersection.lineIntersection(
                    edges[i][0].x, edges[i][0].y,
                    edges[i][1].x, edges[i][1].y,
                    tail.x,        tail.y,
                    tail.x + directionUnitVector.x, tail.y + directionUnitVector.y
                );

                if (intersection && intersection instanceof Vector2) {
                    // Choose the normal vector that points the opposite direction of
                    //   the incoming ray
                    var normal1 = this._normal1.set(edges[i][1]).sub(edges[i][0]).rotate(+Math.PI / 2).normalize();
                    var normal2 = this._normal2.set(edges[i][1]).sub(edges[i][0]).rotate(-Math.PI / 2).normalize();
                    var unitNormal = directionUnitVector.dot(normal1) < 0 ? normal1 : normal2;

                    // Add to the list of intersections
                    intersections.push(Intersection.create(unitNormal, intersection));
                }
            }
        },

        /**
         * Returns an array of lines (pairs of points) that make up the edges of the shape
         */
        getEdges: function() {
            // Create a cached version of the array if it doesn't exist
            if (!this._edges) {
                this._edges = [];
                for (var k = 0; k < this.piecewiseCurve.length(); k++)
                    this._edges.push([]);
            }

            var edges = this._edges;
            var piecewiseCurve = this.piecewiseCurve;
            for (var i = 0; i < piecewiseCurve.length(); i++) {
                // Make sure to loop from the last point to the first point
                var next = (i === piecewiseCurve.length() - 1) ? 0 : i + 1;
                edges[i][0] = piecewiseCurve.at(i);
                edges[i][1] = piecewiseCurve.at(next);
            }

            return edges;
        },

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
        getReferencePoint: function() {
            return this.piecewiseCurve.at(this.referencePointIndex);
        },

        /**
         * Returns whether the shape contains a given point
         */
        contains: function(point) {
            return this.piecewiseCurve.contains(point);
        }

    });

    return Polygon;
});
