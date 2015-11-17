define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PooledObject = require('common/pooled-object/pooled-object');

    /**
     * Represents an equation in the series of equations used to solve the circuit.
     */
    var Equation = PooledObject.extend({

        /**
         * Initializes the Equation's properties with provided initial values
         */
        init: function(rhs, terms) {
            this.rhs = rhs;
            this.terms = terms;
        },

        stamp: function(row, A, z, variables) {
            z.set(row, 0, rhs);
            for (var i = 0; i < this.terms.length; i++) {
                var a = this.terms[i];
                A.set(row, variables.indexOf(a.variable), a.coefficient + A.get(row, variables.indexOf(a.variable)));
            }
        }

    });


    return Equation;
});