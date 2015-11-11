define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Constants = require('constants');

    var SmoothData = function(windowSize) {
        this.data = [];
        this.windowSize = windowSize;
    };

    _.extend(SmoothData.prototype, {

        numDataPoints: function() {
            return this.data.length;
        },

        getWindowSize: function() {
            return this.windowSize;
        },

        addData: function(d) {
            this.data.push(d);
            while (this.data.length > this.windowSize)
                this.data.shift();
        },

        getAverage: function() {
            var sum = 0;
            for (var i = 0; i < this.data.length; i++)
                sum += this.data[i];
            return sum / this.data.length;
        },

        getMedian: function() {
            var list = this.data.slice();
            list.sort();
            var elm = Math.floor(list.length / 2);
            return this.data[elm];
        }

        dataAt: function(elm) {
            return this.data[elm];
        }

    });

    return SmoothData;
});