define(function (require) {

    'use strict';

    /**
     * Returns the calculated area of the polygon.
     *
     * Algorithm from http://stackoverflow.com/a/16283349/4085004
     */
    var getPolygonArea = function(xPoints, yPoints) {
        var area = 0;
        var i, j;
        var length = xPoints.length;

        for (i = 0, j = length - 1; i < length; j = i, i++) {
            area += xPoints[i] * yPoints[j];
            area -= yPoints[i] * xPoints[j];
        }
        area /= 2;

        return area;
    };

    return getPolygonArea;
});
