define(function (require) {

    'use strict';

    /**
     * From https://github.com/substack/rref by substack, this function performs
     *   Gaussian elimination in place on an array of arrays representing a matrix.
     *   Rref stands for "reduced row echelon form".
     */
    var rref = function(A) {
        var rows = A.length;
        var columns = A[0].length;
        
        var lead = 0;
        for (var k = 0; k < rows; k++) {
            if (columns <= lead) return;
            
            var i = k;
            while (A[i][lead] === 0) {
                i++;
                if (rows === i) {
                    i = k;
                    lead++;
                    if (columns === lead) return;
                }
            }
            var irow = A[i], krow = A[k];
            A[i] = krow, A[k] = irow;
             
            var val = A[k][lead];
            for (var j = 0; j < columns; j++) {
                A[k][j] /= val;
            }
             
            for (var i = 0; i < rows; i++) {
                if (i === k) continue;
                val = A[i][lead];
                for (var j = 0; j < columns; j++) {
                    A[i][j] -= val * A[k][j];
                }
            }
            lead++;
        }
        return A;
    };

    /**
     * The following source is a fork of https://github.com/geastwood/matrix
     *   I've added the solving functionality through the use of a Gaussian-
     *   elimination library.  Also, it used to be 1-indexed instead of 0-
     *   indexed, so I changed that.
     */
    
    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    var mixin = function(target) {
        for (var prop in Matrix.prototype) {
            target[prop] = Matrix.prototype[prop];
        }

        return target;
    };

    // constructor
    var Matrix = function(obj) {
        // pass array, then mixin and return
        if (obj && isArray(obj)) {
            return mixin(obj);
        }

        // create new `matrix` with `m`, `n`, `default`
        if (arguments.length >= 2) {
            this.create.apply(this, arguments);
        }
    };

    // setup prototype chain to inherit `Array`
    var F = function() {};
    F.prototype = Array.prototype;
    Matrix.prototype = new F();

    Matrix.prototype.create = function(m, n, v) {

        function makeArray(size, defaultValue) {
            /* jshint validthis:true */
            var i = -1, rst = this;

            while (++i < size) {
                if (isArray(defaultValue)) {
                    // make sure to insert copy of the `array`
                    defaultValue = defaultValue.slice();
                }
                rst.push(defaultValue);
            }
            return rst;
        }

        if (typeof v === 'undefined') {
            v = 0;
        }

        // rebind `this` while calling `makeArray`
        return makeArray.call(this, m, []).map(function(item, i) {
            return makeArray.call(this[i], n, v);
        }, this);
    };

    Matrix.prototype.row = function(m) {
        return this[m];
    };

    Matrix.prototype.col = function(n) {
        return this.map(function(row) {
            return row[n];
        });
    };

    Matrix.prototype.position = function(m, n, v) {
        // if pass additional parameter, use as a setter
        if (arguments.length === 3) {
            this[m][n] = v;
            return this; // if setter, maintain chaining
        } else {
            return this[m][n];
        }
    };

    Matrix.prototype.set = function(m, n, v) {
        this[m][n] = v;
        return this;
    };

    Matrix.prototype.get = function(m, n) {
        return this[m][n];
    };

    Matrix.prototype.size = function() {
        var m = 0, n = 0;
        m = this.col(0).length;
        n = this.row(0).length;
        return {
            m: m,
            n: n
        };
    };

    Matrix.prototype.loop = function(fn) {
        var that = this;
        this.forEach(function(row, i) {
            row.forEach(function(item, j) {
                fn.call(that, i, j, item);
            });
        });
    };


    /**
     * Added functionality
     */

    Matrix.prototype.toArray = function() {
        var rows = this.col(0).length;
        var cols = this.row(0).length;
        var array = [];

        for (var i = 0; i < rows; i++) {
            array[i] = [];
            for (var j = 0; j < cols; j++) {
                array[i][j] = this[i][j];
            }
        }

        return array;
    };

    Matrix.prototype.clone = function() {
        var clone = Matrix(this.toArray());

        return clone;
    };

    Matrix.prototype.rref = function() {
        return rref(this.toArray());
    };

    /**
     * For the equation A * X = B, where X and B are single columns, solves for X and returns it.
     */
    Matrix.prototype.solve = function(B, returnArray) {
        if (this.length < 1)
            throw 'Matrix must have at least one row to solve.';

        if (this.length !== B.length)
            throw 'A and B must have the same number of rows.';

        // Create another column on the matrix with B's values
        var matrix = this.toArray();
        var r;
        if (B instanceof Matrix) {
            for (var r = 0; r < B.length; r++)
                matrix[r].push(B[r][0]);
        }
        else {
            for (var r = 0; r < B.length; r++)
                matrix[r].push(B[r]);
        }

        // Solve using row reduction
        rref(matrix);
        var lastColumnIndex = matrix[0].length - 1;

        // Put the answers in their own array.
        var X;
        if (returnArray) {
            X = [];
            for (var i = 0; i < this.length; i++)
                X[i] = matrix[i][lastColumnIndex];
        } 
        else {
            X = new Matrix(this.length, 1);
            for (var i = 0; i < this.length; i++)
                X.set(i, 0, matrix[i][lastColumnIndex]);
        }

        return X;
    };

    return Matrix;

});