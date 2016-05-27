define(function (require) {

    'use strict';

    var PolynomialTerm = require('./polynomial-term');

    /**
     * AssociatedLegendrePolynomials implements associated Legendre polymonials.
     */
    var AssociatedLegendrePolynomials = {

        /**
         * Solves the associated Legendre polynomial.
         * 
         * This solution uses Wolfram's definition of the associated Legendre polynomial.
         * See http://mathworld.wolfram.com/LegendrePolynomial.html.
         * When l > 6, this implemention starts to differ from Wolfram and "Numerical Recipes in C".
         * To compare with Mathematica online, use: x^2*(3)*( LegendreP[7,3,-0.99])
         * as the input to The Integrator at http://integrals.wolfram.com/index.jsp
         * 
         * For a description of why this doesn't work for l > 6,
         * see Section 6.8 of "Numerical Recipes in C, Second Edition" (1992) at
         * http://www.nrbook.com/a/bookcpdf/c6-8.pdf
         * 
         * @param l electron's secondary state
         * @param m electron's tertiary state
         * @param x coordinate on horizontal axis
         * @return double
         * @throws exception if l > 6
         */
        solve: function(l, m, x) {
            // Validate arguments
            if (l > 6) {
                // For large l, the brute-force solution below encounters instabilities.
                throw 'unstable for l > 6';
            }
            if (l < 0) {
                throw 'l out of bounds: ' + l;
            }
            if (m < 0 || m > l) {
                throw 'm out of bounds: ' + m;
            }
            if (Math.abs(x) > 1) {
                throw 'x out of bounds: ' + x;
            }

            var productTerms = [];
            productTerms.push(new PolynomialTerm(0, 1));

            for (var i = 0; i < l; i++) {
                //x^2-1 times each term on left side
                var terms = [];
                for (var k = 0; k < productTerms.size(); k++ ) {
                    var term = productTerms[k];
                    terms.push(new PolynomialTerm(term.getPower() + 2, term.getCoeff()));
                    terms.push(new PolynomialTerm(term.getPower(),     term.getCoeff() * -1));
                }
                productTerms = terms;
            }

            for (var k = 0; k < productTerms.size(); k++)
                productTerms[k] = productTerms[k].derive(l + m);

            // Wolfram says there is a sign convention difference here
            var sum = this.eval(productTerms, x);
            var legendre = Math.pow(-1, m) / (Math.pow(2, l) * this.fact(l)) * Math.pow(1 - x * x, m / 2) * sum;

            return legendre;
        },

        eval: function(productTerms, x) {
            var sum = 0;
            for (var i = 0; i < productTerms.length; i++)
                sum += productTerms[i].eval(x);
            return sum;
        },

        fact: function(a) {
            return (a === 0 || a === 1) ? 1 : a * this.fact(a - 1);
        }

    };

    return AssociatedLegendrePolynomials;
});