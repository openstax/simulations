define(function (require) {

    'use strict';

    /**
     * Finds the roots of a quadratic equation.  One can optionally pass in
     *   a roots array to store the results.
     */
    var quadraticRoots = function(a, b, c, roots) {
    	if (!roots)
    		roots = [];

        var sqrt = Math.sqrt((b * b) - 4 * a * c);

        roots[0] = (-b + sqrt) / (2 * a);
        roots[1] = (-b - sqrt) / (2 * a);
        return roots;
    };

    return quadraticRoots;
});
