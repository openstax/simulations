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
            this.terms = (_.isArray(terms)) ? terms : [terms];
        },

        stamp: function(row, A, z, indexOfVariable) {
            z.set(row, 0, this.rhs);
            for (var i = 0; i < this.terms.length; i++) {
                var term = this.terms[i];
                var index = indexOfVariable(term.variable);
                // console.log(row, index)
                A.set(row, index, term.coefficient + A.get(row, index));
            }
        }

    });


    return Equation;
});