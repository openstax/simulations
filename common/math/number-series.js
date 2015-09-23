define(function (require) {

    'use strict';

    /**
     * NumberSeries provides a place to store a series of numbers, and functions
     *   for calculating their average and sum.  It has a max size and drops
     *   old data points when the limit is reached in a FIFO fashion.
     *
     * NumberSeries is a port of PhET's DoubleSeries, originally by Sam Reid.
     */
    var NumberSeries = function(maxSize) {
        this.data = [];
        this.maxSize = maxSize;
    };

    NumberSeries.prototype.add = function(value) {
        this.data.push(value);
        if (this.data.length > this.maxSize)
            this.data.shift();
    };

    NumberSeries.prototype.length = function() {
        return this.data.length;
    };

    NumberSeries.prototype.average = function() {
        return this.sum() / this.length();
    };

    NumberSeries.prototype.avg = NumberSeries.prototype.average;

    NumberSeries.prototype.sum = function() {
        var sum = 0;
        for (var i = 0; i < this.data.length; i++)
            sum += this.data[i];
        return sum;
    };

    NumberSeries.prototype.clear = function() {
        this.data = [];
    };

    return NumberSeries;

});