define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    require('../node_modules/least-squares/lib/least-squares'); var leastSquares = window.lsq;

    /**
     * Source ported from phet.common.motion.MotionMath.
     */
    var MotionMath = {

        /**
         * Cached objects
         */
        _linearRegressionResults: {},

        /**
         * Estimates a derivative using a series of points to 
         *   create a least-squares regression line to find a
         *   linear function from which it can take a derivative.
         * Expects an array of objects that have a "time" and
         *   a "value" property.
         */
        estimateDerivative: function(timeSeries) {
            var out = this.getLinearRegressionCoefficients(timeSeries);
            if (_.isNaN(out.m) || !_.isFinite(out.m)) {
                // PhET never finished this: "todo handle this error elsewhere"
                return 0;
            }
            return out.m;
        },

        /**
         * Returns an object that looks like this: {
         *     m: line slope
         *     b: line intercept
         * }
         *
         * See https://www.npmjs.org/package/least-squares for details
         */
        getLinearRegressionCoefficients: function(timeSeries) {
            var X = [];
            var Y = [];
            for (var i = 0; i < timeSeries.length; i++) {
                X[i] = timeSeries[i].time;
                Y[i] = timeSeries[i].value;
            }
            leastSquares(X, Y, false, this._linearRegressionResults);
            return this._linearRegressionResults;
        },

        /**
         * Returns the average time value in a data series.
         */
        averageTime: function(timeSeries) {
            var a = 0;
            for (var i = 0; i < timeSeries.length; i++) {
                a += timeSeries[i].time;
            }
            return a / timeSeries.length;
        },

        /**
         * Returns a point with an estimated derivative as its value
         *   and an average time as its time.
         */
        getDerivative: function(recentPositionTimeSeries) {
            if (recentPositionTimeSeries.length === 0) {
                return {
                    value: 0,
                    time:  0
                };
            }
            else {
                return {
                    value: this.estimateDerivative(recentPositionTimeSeries),
                    time:  this.averageTime(recentPositionTimeSeries)
                };
            }
        },

        /**
         * PhET docs:
         *
         * "Gets the second derivative of the given time series data using the
         *  central difference formula
         *  See: http://mathews.ecs.fullerton.edu/n2003/NumericalDiffMod.html"
         *
         * Takes a data series called "x"
         */
        getSecondDerivative: function(x) {
            if (x.length === 0) {
                return {
                    value: 0,
                    time:  0
                };
            }
            var sum = 0;
            var count = 0;
            for (var i = 1; i < x.length - 1; i++) {
                sum += this._getSecondDerivative(x[i - 1], x[i], x[i + 1]);
                count ++;
            }
            if (count === 0) {
                return {
                    value: 0,
                    time: this.averageTime(x)
                };
            }
            else {
                return {
                    value: sum / count,
                    time: this.averageTime(x)
                };
            }
        },

        /**
         * getSecondDerivative was an overloaded function in PhET's MotionMath
         *   class, so I've separated the heart of the algorithm into its own
         *   function.
         */
        _getSecondDerivative: function(a, b, c) {
            var num = a.value - 2*b.value + c.value;
            var h1 = c.time - b.time;
            var h2 = b.time - a.time;
            var h = (h1 + h2) / 2;
            if (h === 0)
                throw '_getSecondDerivative: h was zero';
            else
                return num / (h * h);
        }

    };

    return MotionMath;

});