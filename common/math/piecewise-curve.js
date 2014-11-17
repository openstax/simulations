define(function (require) {

    'use strict';

    var _              = require('underscore');
    var solveQuadratic = require('solve-quadratic-equation');
    var solveCubic     = require('solve-cubic-equation');

    /**
     * The purpose of this class is to store paths of points and waypoints in
     *   the case of curved connections.  This is not a piecewise linear curve
     *   because each connection between two points can have one of several
     *   types of algorithms (linear, quadratic, and cubic)
     */
    var PiecewiseCurve = function(energyType, position, velocity, visible) {
        
    };

    /**
     * Constants
     */
    PiecewiseCurve.SEG_MOVETO  = 0;
    PiecewiseCurve.SEG_LINETO  = 1;
    PiecewiseCurve.SEG_QUADTO  = 2;
    PiecewiseCurve.SEG_CUBICTO = 3;
    PiecewiseCurve.SEG_CLOSE   = 4;

    // Java docs: "A big number, but not so big it can't survive a few float operations"
    PiecewiseCurve.BIG_VALUE = Number.MAX_VALUE / 10;

    /**
     * Functions
     */
    _.extend(PiecewiseCurve.prototype, {

        evaluateCrossings: function(x, y, neg, useYAxis, distance) {
            var cx = 0;
            var cy = 0;
            var firstx = 0;
            var firsty = 0;

            var negative = (neg) ? -1 : 1;

            var x0;
            var x1;
            var x2;
            var x3;

            var y0;
            var y1;
            var y2;
            var y3;

            var r = [];
            var nRoots;
            var epsilon = 0.0;
            var pos = 0;
            var windingNumber = 0;
            var pathStarted = false;

            var xpoints;
            var ypoints;
            var types = this.types;

            if (!this.points.length)
                return 0;

            if (useYAxis) {
                // Trade axes
                xpoints = this.yPoints;
                ypoints = this.xPoints;
                var swap = y;
                y = x;
                x = swap;
            }

            /* Get a value which is hopefully small but not insignificant relative the path. */
            epsilon = ypoints[0] * 1E-7;
            
            if (epsilon == 0) 
                epsilon = 1E-7;
            
            pos = 0;
            while (pos < index) {
                switch (types[pos]) {
                    case PiecewiseCurve.SEG_MOVETO:
                        if (pathStarted) // close old path
                        {
                            x0 = cx;
                            y0 = cy;
                            x1 = firstx;
                            y1 = firsty;

                            if (y0 == 0.0)
                                y0 -= epsilon;
                            if (y1 == 0.0)
                                y1 -= epsilon;
                            if (Line2D.linesIntersect(x0, y0, x1, y1, epsilon, 0.0, distance, 0.0))
                                windingNumber += (y1 < y0) ? 1 : negative;

                            cx = firstx;
                            cy = firsty;
                        }
                        cx = firstx = xpoints[pos] - (float) x;
                        cy = firsty = ypoints[pos++] - (float) y;
                        pathStarted = true;
                        break;
                    case PiecewiseCurve.SEG_CLOSE:
                        x0 = cx;
                        y0 = cy;
                        x1 = firstx;
                        y1 = firsty;

                        if (y0 == 0.0)
                            y0 -= epsilon;
                        if (y1 == 0.0)
                            y1 -= epsilon;
                        if (Line2D.linesIntersect(x0, y0, x1, y1, epsilon, 0.0, distance, 0.0))
                            windingNumber += (y1 < y0) ? 1 : negative;

                        cx = firstx;
                        cy = firsty;
                        pos++;
                        pathStarted = false;
                        break;
                    case PiecewiseCurve.SEG_LINETO:
                        x0 = cx;
                        y0 = cy;
                        x1 = xpoints[pos]   - x;
                        y1 = ypoints[pos++] - y;

                        if (y0 == 0.0)
                            y0 -= epsilon;
                        if (y1 == 0.0)
                            y1 -= epsilon;
                        if (Line2D.linesIntersect(x0, y0, x1, y1, epsilon, 0.0, distance, 0.0))
                            windingNumber += (y1 < y0) ? 1 : negative;

                        cx = xpoints[pos - 1] - x;
                        cy = ypoints[pos - 1] - y;
                        break;
                    case PiecewiseCurve.SEG_QUADTO:
                        x0 = cx;
                        y0 = cy;
                        x1 = xpoints[pos]   - x;
                        y1 = ypoints[pos++] - y;
                        x2 = xpoints[pos]   - x;
                        y2 = ypoints[pos++] - y;

                        /* check if curve may intersect X+ axis. */
                        if ((x0 > 0.0 || x1 > 0.0 || x2 > 0.0) && (y0 * y1 <= 0 || y1 * y2 <= 0)) {
                            if (y0 == 0.0)
                                y0 -= epsilon;
                            if (y2 == 0.0)
                                y2 -= epsilon;

                            r[0] = y0;
                            r[1] = 2 * (y1 - y0);
                            r[2] = (y2 - 2 * y1 + y0);

                            /* degenerate roots (=tangent points) do not
                            contribute to the winding number. */
                            if ((nRoots = solveQuadratic(r)) == 2) {
                                for (int i = 0; i < nRoots; i++) {
                                    var t = r[i];
                                    if (t > 0 && t < 1) {
                                        var crossing = t * t * (x2 - 2 * x1 + x0) + 2 * t * (x1 - x0) + x0;
                                        if (crossing >= 0.0 && crossing <= distance)
                                            windingNumber += (2 * t * (y2 - 2 * y1 + y0) + 2 * (y1 - y0) < 0) ? 1 : negative;
                                    }
                                }
                            }
                        }

                        cx = xpoints[pos - 1] - x;
                        cy = ypoints[pos - 1] - y;
                        break;
                    case PiecewiseCurve.SEG_CUBICTO:
                        x0 = cx;
                        y0 = cy;
                        x1 = xpoints[pos]   - x;
                        y1 = ypoints[pos++] - y;
                        x2 = xpoints[pos]   - x;
                        y2 = ypoints[pos++] - y;
                        x3 = xpoints[pos]   - x;
                        y3 = ypoints[pos++] - y;

                        /* check if curve may intersect X+ axis. */
                        if ((x0 > 0.0 || x1 > 0.0 || x2 > 0.0 || x3 > 0.0) && (y0 * y1 <= 0 || y1 * y2 <= 0 || y2 * y3 <= 0)) {
                            if (y0 == 0.0)
                                y0 -= epsilon;
                            if (y3 == 0.0)
                                y3 -= epsilon;

                            r[0] = y0;
                            r[1] = 3 * (y1 - y0);
                            r[2] = 3 * (y2 + y0 - 2 * y1);
                            r[3] = y3 - 3 * y2 + 3 * y1 - y0;

                            if ((nRoots = solveCubic(r)) != 0) {
                                for (int i = 0; i < nRoots; i++) {
                                    var t = r[i];
                                    if (t > 0.0 && t < 1.0) {
                                        var crossing = -(t * t * t) * (x0 - 3 * x1 + 3 * x2 - x3)
                                                     + 3 * t * t * (x0 - 2 * x1 + x2)
                                                     + 3 * t * (x1 - x0) + x0;
                                        if (crossing >= 0 && crossing <= distance) {
                                            windingNumber += (3 * t * t * (y3 + 3 * y1 - 3 * y2 - y0)
                                                            + 6 * t * (y0 - 2 * y1 + y2)
                                                            + 3 * (y1 - y0) < 0) ? 1 : negative;
                                        }
                                    }
                                }
                            }
                        }

                        cx = xpoints[pos - 1] - x;
                        cy = ypoints[pos - 1] - y;
                        break;
                }
            }
            
            return windingNumber;
        }

    });

    return PiecewiseCurve;
});

