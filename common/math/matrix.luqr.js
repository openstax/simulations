define(function (require) {

    'use strict';

    var Matrix = require('./matrix');
    var luqr   = require('./luqr').luqr;

    /**
     * For the equation A * X = B, where X and B are single columns, solves for X and returns it.
     */
    Matrix.prototype.solve = function(B, returnArray) {
        if (this.length < 1) {
            if (returnArray)
                return [];
            else
                return new Matrix(0, 0);
        }

        if (this.length !== B.length)
            throw 'A and B must have the same number of rows.';

        var b = [];
        for (var r = 0; r < B.length; r++)
            b[r] = B[r][0];

        var X = luqr.solve(this, b);

        if (returnArray) {
            return X;
        } 
        else {
            var matrix = new Matrix(X.length, 1);

            for (var i = 0; i < X.length; i++)
                matrix.set(i, 0, X[i]);

            return matrix;
        }
    };

    return Matrix;

});