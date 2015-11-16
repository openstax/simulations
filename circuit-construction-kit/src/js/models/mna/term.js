define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Pooled = require('models/mna/pooled');

    /**
     * Represents a single term in an equation
     */
    var Term = function() {
        Pooled.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(Term.prototype, Pooled.prototype, {

        /**
         * Initializes the Term's properties with provided initial values
         */
        init: function(coefficient, variable) {
            this.coefficient = coefficient;
            this.variable = variable;
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(Term, Pooled);


    return Term;
});