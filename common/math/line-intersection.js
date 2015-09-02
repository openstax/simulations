/**
 * Fork of https://github.com/psalaets/line-intersect/blob/master/lib/check-intersection.js
 *
 * Follows the same algorithm as the source, but it doesn't create objects on every call.
 *   Also adds a wrapper function that just returns true/false if the segments intersect.
 */
define(function (require) {

    'use strict';

    require('./polyfills');
    var Vector2 = require('./vector2');

    var _point = new Vector2();
    var _circleIntersectionPoint1 = new Vector2();
    var _circleIntersectionPoint2 = new Vector2();

    var LineIntersection = {

        /**
         * Returns the point at which two lines intersect or a string
         *   describing the relationship between the lines if they do
         *   not intersect. The 1st through 4th parameters define the
         *   first line.  The 5th through 8th parameters define the
         *   second line.
         */
        lineIntersection: function(x1, y1, x2, y2, x3, y3, x4, y4) {
            var denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
            var numeA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
            var numeB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));

            if (denom === 0) {
                if (numeA === 0 && numeB === 0)
                    return 'colinear';
                return 'parallel';
            }

            var uA = numeA / denom;
            var uB = numeB / denom;

            if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
                return _point.set(
                    x1 + (uA * (x2 - x1)),
                    y1 + (uA * (y2 - y1))
                );
            }

            return 'none';
        },

        /**
         * Returns whether or not two lines intersect. The 1st through
         *   4th parameters define the first line. The 5th through 8th
         *   parameters define the second line.
         */
        linesIntersect: function(x1, y1, x2, y2, x3, y3, x4, y4) {
            if (LineIntersection.lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) instanceof Vector2)
                return true;
            else
                return false;
        },

        /**
         * Returns the points where a line intersects a circle if they exist.
         *
         * Ported from phetcommon.math.MathUtil.getLineCircleIntersection,
         *   which was adapted from:
         *
         *   Weisstein, Eric W. "Circle-Line Intersection."
         *   From MathWorld--A Wolfram Web Resource. 
         *   http://mathworld.wolfram.com/Circle-LineIntersection.html
         */
        lineCircleIntersection: function(x1, y1, x2, y2, circleX, circleY, radius) {
            var cx = circleX;
            var cy = circleY;
            x1 -= cx;
            x2 -= cx;
            y1 -= cy;
            y2 -= cy;
            var r = radius;
            var dx = x2 - x1;
            var dy = y2 - y1;
            var dr = Math.sqrt(dx * dx + dy * dy);
            var D = x1 * y2 - x2 * y1;

            var discriminant = r * r * dr * dr - D * D;
            var radical = Math.sqrt(discriminant);
            var numeratorX_1 = D * dy - Math.sign(dy) * dx * radical;
            var numeratorX_2 = D * dy + Math.sign(dy) * dx * radical;

            var numeratorY_1 = -D * dx - Math.abs(dy) * radical;
            var numeratorY_2 = -D * dx + Math.abs(dy) * radical;

            var result = [ null, null ];

            if (discriminant >= 0) {
                var denom = dr * dr;
                result[0] = _circleIntersectionPoint1.set(cx + numeratorX_1 / denom, cy + numeratorY_1 / denom);
                result[1] = _circleIntersectionPoint2.set(cx + numeratorX_2 / denom, cy + numeratorY_2 / denom);
            }

            return result;
        }

    };

    return LineIntersection;
});