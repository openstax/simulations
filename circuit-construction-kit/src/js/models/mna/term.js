define(function (require) {

    'use strict';

    var PooledObject = require('common/pooled-object/pooled-object');

    /**
     * Represents a single term in an equation
     */
    var Term = PooledObject.extend({

        /**
         * Initializes the Term's properties with provided initial values
         */
        init: function(coefficient, variable) {
            this.coefficient = coefficient;
            this.variable = variable;
        }

    });


    return Term;
});