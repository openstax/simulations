define(function (require) {

    'use strict';

    var Matrix = require('./matrix');
    var luqr   = require('luqr').luqr;

    /**
     * For the equation A * X = B, where X and B are single columns, solves for X and returns it.
     */
    Matrix.prototype.solve = function(B) {
        if (this.length < 1) {
            if (returnArray)
                return [];
            else
                return new Matrix(0, 0);
        }

        if (this.length !== B.length)
            throw 'A and B must have the same number of rows.';

        var X = luqr.solve(this, B);

        return X;
    };

    return Matrix;

});