/**
 * Fork of https://github.com/psalaets/line-intersect/blob/master/lib/check-intersection.js
 *
 * Follows the same algorithm as the source, but it doesn't create objects on every call.
 *   Also adds a wrapper function that just returns true/false if the segments intersect.
 */
define(function (require) {

    'use strict';

    var Vector2 = require('./vector2');

    var _point = new Vector2();

    var LineIntersection = {

        lineIntersection: function(x1, y1, x2, y2, x3, y3, x4, y4) {
            var denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
            var numeA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
            var numeB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));

            if (denom == 0) {
                if (numeA == 0 && numeB == 0)
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

        linesIntersect: function(x1, y1, x2, y2, x3, y3, x4, y4) {
            if (LineIntersection.lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) instanceof Vector2)
                return true;
            else
                return false;
        }

    };

    return LineIntersection;
});