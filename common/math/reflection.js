define(function (require) {

    'use strict';

    var Vector2 = require('./vector2');

    var _point = new Vector2();

    var Reflection = {

        /**
         * Reflects a point across a line defined by a point on the line
         *   and the line's slope given as an angle in radians.
         */
        reflectPointAcrossLine: function(point, pointOnLine, lineAngle) {
            var alpha = lineAngle % (Math.PI * 2);
            var gamma = Math.atan2((point.y - pointOnLine.y), (point.x - pointOnLine.x)) % (Math.PI * 2);
            var theta = (2 * alpha - gamma) % (Math.PI * 2);
            var dist = point.distance(pointOnLine);
            return _point.set(
                pointOnLine.x + dist * Math.cos(theta),
                pointOnLine.y + dist * Math.sin(theta)
            );
        }

    };

    return Reflection;
});