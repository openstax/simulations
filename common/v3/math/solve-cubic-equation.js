define(function (require) {

    'use strict';

    var solveQuadratic = require('../node_modules/solve-quadratic-equation-shimmed/index');

    /**
     * Modeled after the source for java.awt.geom.CubicCurve2D.solveCubic
     *   (http://developer.classpath.org/doc/java/awt/geom/CubicCurve2D-source.html).
     *   It is almost verbatim except that I return the array instead of
     *   the number of roots.
     *
     * @param equation an array with the coefficients of the equation.
     *
     * @return the number of non-complex solutions. A rootsult of 0
     *   indicates that the equation has no non-complex solutions. A
     *   rootsult of -1 indicates that the equation is constant (i.e.,
     *   always or never zero).
     */
    return function(equation, roots) {
        var a;
        var b;
        var c;
        var q;
        var r;
        var Q;
        var R;
        var c3;
        var Q3;
        var R2;
        var CR2;
        var CQ3;
        var sqrtQ;

        if (roots === undefined)
            roots = [];

        // If the cubic coefficient is zero, we have a quadratic equation.
        c3 = equation[3];
        if (c3 === 0) {
            var rootsults = solveQuadratic(equation[0], equation[1], equation[2]);
            for (var i = 0; i < rootsults.length; i++)
                roots[i] = rootsults[i];
            return roots;
        }
        
        // Divide the equation by the cubic coefficient.
        c = equation[0] / c3;
        b = equation[1] / c3;
        a = equation[2] / c3;
        
        // We now need to solve x^3 + ax^2 + bx + c = 0.
        q = a * a - 3 * b;
        r = 2 * a * a * a - 9 * a * b + 27 * c;
        
        Q = q / 9;
        R = r / 54;
        
        Q3 = Q * Q * Q;
        R2 = R * R;
        
        CR2 = 729 * r * r;
        CQ3 = 2916 * q * q * q;
        
        if (R === 0 && Q === 0) {
            // The GNU Scientific Library would return three identical
            // solutions in this case.
            roots[0] = -a / 3;
            return roots;
        }
        
        if (CR2 === CQ3) {
            /* this test is actually R2 == Q3, written in a form suitable
            for exact computation with integers */
            /* Due to finite precision some double roots may be missed, and
            considered to be a pair of complex roots z = x +/- epsilon i
            close to the real axis. */
            sqrtQ = Math.sqrt(Q);

            if (R > 0) {
                roots[0] = -2 * sqrtQ - a / 3;
                roots[1] = sqrtQ - a / 3;
            }
            else {
                roots[0] = -sqrtQ - a / 3;
                roots[1] = 2 * sqrtQ - a / 3;
            }
            return roots;
        }
        
        if (CR2 < CQ3) { /* equivalent to R2 < Q3 */
            sqrtQ = Math.sqrt(Q);
            var sqrtQ3 = sqrtQ * sqrtQ * sqrtQ;
            var theta = Math.acos(R / sqrtQ3);
            var norm = -2 * sqrtQ;
            roots[0] = norm * Math.cos(theta / 3) - a / 3;
            roots[1] = norm * Math.cos((theta + 2.0 * Math.PI) / 3) - a / 3;
            roots[2] = norm * Math.cos((theta - 2.0 * Math.PI) / 3) - a / 3;

            // The GNU Scientific Library sorts the rootsults. We don't.
            return roots;
        }
        
        var sgnR = (R >= 0 ? 1 : -1);
        var A = -sgnR * Math.pow(Math.abs(R) + Math.sqrt(R2 - Q3), 1.0 / 3.0);
        var B = Q / A;
        roots[0] = A + B - a / 3;
        return roots;
    };
});
