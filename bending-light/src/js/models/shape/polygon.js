define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PiecewiseCurve     = require('common/math/piecewise-curve');
    var LineIntersection   = require('common/math/line-intersection');
    var Vector2            = require('common/math/vector2');
    var getPolygonCentroid = require('common/math/get-polygon-centroid');

    var Shape        = require('models/shape');
    var Intersection = require('models/intersection');

    /**
     * 
     */
    var Polygon = function(points, referencePointIndex) {
        Shape.apply(this, arguments);

        if (points)
            this.piecewiseCurve = PiecewiseCurve.fromPoints(points);

        this.referencePointIndex = referencePointIndex;

        this._normal1 = new Vector2();
        this._normal2 = new Vector2();
        this._centroid = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(Polygon.prototype, Shape.prototype, {

        /**
         * Translates the shape
         */
        translate: function(dx, dy) {
            this.piecewiseCurve.translate(dx, dy);
        },

        /**
         * Rotates the shape
         */
        rotate: function(radians) {
            this.piecewiseCurve.rotate(radians);
        },

        /**
         * Returns a piecewise curve approximation
         */
        toPiecewiseCurve: function() {
            return this.piecewiseCurve.clone();
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
                    edges[i][0].x,        edges[i][0].y,
                    edges[i][1].x,        edges[i][1].y,
                    tail.x,               tail.y,
                    tail.x + direction.x, tail.y + direction.y
                );
                
                if (intersection && intersection instanceof Vector2) {
                    // Choose the normal vector that points the opposite direction of
                    //   the incoming ray
                    var normal1 = this._normal1.set(edges[i][1]).sub(edges[i][0]).rotate(+Math.PI / 2).normalize();
                    var normal2 = this._normal2.set(edges[i][1]).sub(edges[i][0]).rotate(-Math.PI / 2).normalize();
                    var unitNormal = direction.dot(normal1) < 0 ? normal1 : normal2;

                    // Add to the list of intersections
                    intersections.push(Intersection.create(unitNormal, intersection));
                }
            }

            return intersections;
        },

        /**
         * Returns an array of lines (pairs of points) that make up the edges of the shape
         */
        getEdges: function() {
            // Create a cached version of the array if it doesn't exist
            if (!this._edges) {
                this._edges = [];
                for (var k = 0; k < this.piecewiseCurve.length(); k++)
                    this._edges.push([new Vector2(), new Vector2()]);
            }

            var edges = this._edges;
            var piecewiseCurve = this.piecewiseCurve;
            for (var i = 0; i < piecewiseCurve.length(); i++) {
                // Make sure to loop from the last point to the first point
                var next = (i === piecewiseCurve.length() - 1) ? 0 : i + 1;
                edges[i][0].x = piecewiseCurve.at(i).x;
                edges[i][0].y = piecewiseCurve.at(i).y;
                edges[i][1].x = piecewiseCurve.at(next).x;
                edges[i][1].y = piecewiseCurve.at(next).y;
            }

            return edges;
        },

        /**
         * Returns the calculated centroid of the polygon as a Vector2.
         */
        getCentroid: function() {
            return getPolygonCentroid(
                this.piecewiseCurve.xPoints,
                this.piecewiseCurve.yPoints,
                this._centroid
            );
        },

        /**
         * Translates the polygon's points so its centroid is at the origin
         */
        centerOnCentroid: function() {
            var centroid = this.getCentroid();
            this.piecewiseCurve.translate(-centroid.x, -centroid.y);
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
        },

        /**
         * Clones this shape instance and returns it
         */
        clone: function() {
            var polygon = new Polygon();
            polygon.piecewiseCurve = this.piecewiseCurve.clone();
            polygon.referencePointIndex = this.referencePointIndex;
            return polygon;
        }

    });

    return Polygon;
});
