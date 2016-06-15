define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SchroedingerModel = require('hydrogen-atom/models/atomic-model/schroedinger');

    var DEBUG_CACHE = false;

    /**
     * BrightnessCache is a cache containing brightness information for Schrates.
     * The cache is set up for a fixed number of states, and a fixed size grid.
     */
    var BrightnessCache = function(populate, numVerticalCells, numHorizontalCells, numDepthCells, cellHeight, cellWidth, cellDepth) {
        // Save the number of vertical and horizontal cells
        this.numVerticalCells = numVerticalCells;
        this.numHorizontalCells = numHorizontalCells;
        this.numDepthCells = numDepthCells;
        this.cellHeight = cellHeight;
        this.cellWidth = cellWidth;
        this.cellDepth = cellDepth;

        // Stores brightness as [n][l][m][z][x] = brightness
        this._cache = [];
        this._sums = [];

        this.init(populate);
    };

    _.extend(BrightnessCache.prototype, {

        init: function(populate) {
            // Create an array of arrays like [numVerticalCells][numHorizontalCells];
            this._fillWithArrays(this._sums, this.numVerticalCells);
            
            var n;
            var l;
            var m;
            var nSize = SchroedingerModel.getNumberOfStates();
            var lSize;
            var mSize;

            // Create the cache structure
            this._fillWithArrays(this._cache, nSize);
            for (n = 1; n <= nSize; n++) {
                lSize = n;
                this._fillWithArrays(this._cache[n - 1], lSize);
                // for (l = 0; l < lSize; l++) {
                //     mSize = l + 1;
                //     this._fillWithArrays(this._cache[n - 1][l], mSize);
                // }
            }

            // Pre-populate the cache
            if (populate) {
                for (n = 1; n <= nSize; n++) {
                    lSize = n;
                    for (l = 0; l < lSize; l++) {
                        mSize = l + 1;
                        for (m = 0; m < mSize; m++) {
                            this.getBrightness(n, l, m);
                        }
                    }
                }
            }
        },

        _fillWithArrays: function(array, length) {
            for (var i = 0; i < length; i++)
                array[i] = [];
        },

        /**
         * Gets a cache entry. 
         * If there is no entry, the entry is created.
         */
        getBrightness: function(n, l, m) {
            var brightness = this._cache[n-1][l][m];

            if (!brightness) {
                if (DEBUG_CACHE)
                    throw 'BrightnessCache adding entry for ' + SchroedingerModel.stateToString(n, l, m);

                brightness = this.computeBrightness(n, l, m, this._sums);
                this._cache[n-1][l][m] = brightness;
            }

            return brightness;
        },

        /**
         * Computes the brightness values for a specific state.
         */
        computeBrightness: function(n, l, m, sums) {
            var brightness = [];
            this._fillWithArrays(brightness, this.numVerticalCells);
            
            var maxSum = 0;
            var cellHeight = this.cellHeight;
            var cellWidth = this.cellWidth;
            var cellDepth = this.cellDepth;
            var row;
            var col;
            
            for (row = 0; row < this.numVerticalCells; row++ ) {
                var z = (row * cellHeight) + (cellHeight / 2);
                for (col = 0; col < this.numHorizontalCells; col++) {
                    var x = (col * cellWidth) + (cellWidth / 2);
                    var sum = 0;

                    for (var depth = 0; depth < this.numDepthCells; depth++) {
                        var y = (depth * cellDepth) + (cellDepth / 2);
                        var pd = SchroedingerModel.getProbabilityDensity(n, l, m, x, y, z);
                        sum += pd;
                    }

                    sums[row][col] = sum;
                    if (sum > maxSum)
                        maxSum = sum;
                }
            }

            for (row = 0; row < this.numVerticalCells; row++) {
                for (col = 0; col < this.numHorizontalCells; col++) {
                    var b = 0;
                    if (maxSum > 0)
                        b = sums[row][col] / maxSum;
                    brightness[row][col] = b;
                }
            }
            
            return brightness;
        }

    });


    return BrightnessCache;

});