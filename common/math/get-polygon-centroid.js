define(function (require) {

    'use strict';

    var Vector2        = require('./vector2');
    var getPolygonArea = require('./get-polygon-area');

    /**
     * Returns the calculated area of the polygon.
     *
     * Algorithm from http://stackoverflow.com/a/16283349/4085004
     */
    var getPolygonCentroid = function(xPoints, yPoints, vector) {
        var x = 0;
        var y = 0;
        var f;
        var i, j;
        var point1X, point1Y;
        var point2X, point2Y;
        var length = xPoints.length

        for (i = 0, j = length - 1; i < length; j=i,i++) {
            point1X = xPoints[i];
            point1Y = yPoints[i];
            point2X = xPoints[j];
            point2Y = yPoints[j];
            f = point1X * point2Y - point2X * point1Y;
            x += (point1X + point2X) * f;
            y += (point1Y + point2Y) * f;
        }

        f = getPolygonArea(xPoints, yPoints) * 6;

        if (vector)
            return vector.set(x / f, y / f)
        else
            return new Vector2(x / f, y / f);
    };

    return getPolygonCentroid;
});
