define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('../math/vector2');

    /**
     * Used internally in SamplingMotionModel to keep track
     *   of a history of values and derive velocity and
     *   acceleration from that history.
     *
     * Modeled after edu.colorado.phet.ladybugmotion2d.Motion2DModel.Motion2DValue
     */
    var SamplingMotionModelValue = function(numPoints, halfWindowSize, numPointsAveraged, initialValue) {
        this.avgBefore = 0;
        this.avgMid = 0;
        this.avgNow = 0;
        this.values = [];
        this.averages = [];
        this.halfWindowSize = halfWindowSize;
        this.numPointsAveraged = numPointsAveraged;
        this.numPoints = numPoints;

        this.reset(initialValue);
    };

    /**
     * Instance functions/properties
     */
    _.extend(SamplingMotionModelValue.prototype, {

        reset: function(initialValue) {
            for (var i = 0; i < this.numPoints; i++)
                this.values[i] = initialValue;
        },

        addPoint: function(val) {
            // Put the new value on the end and remove the first
            this.values.push(val);
            this.values.shift();

            // Update averages array
            var averagesLength = this.lengthOfAveragesArray();
            for (var i = 0; i < averagesLength; i++) {
                this.averages[i] = 0;
                for (var j = -halfWindowSize; j <= halfWindowSize; j++)
                    this.averages[i] += this.values[i + halfWindowSize + j];
                this.averages[i] = this.averages[i] / (2 * halfWindowSize + 1);
            }
        },

        addPointAndUpdate: function(val) {
            this.addPoint(val);
            this.updateAverages();
        },

        updateAverages: function() {
            var numPoints = this.numPoints;
            var numPointsAveraged = this.numPointsAveraged;
            var averagesLength = this.lengthOfAveragesArray();

            var sumXBefore = 0;
            var sumXMid = 0;
            var sumXNow = 0;

            var i;

            for (i = 0; i <= (numPointsAveraged - 1); i++)
                sumXBefore += this.averages[i];
            this.avgBefore = sumXBefore / numPointsAveraged;

            for (i = (averagesLength - numPointsAveraged) / 2; i <= (averagesLength + numPointsAveraged - 2) / 2; i++)
                sumXMid += this.averages[i];
            this.avgMid = sumXMid / numPointsAveraged;

            for (i = (averagesLength - numPointsAveraged); i <= (averagesLength - 1); i++)
                sumXNow += this.averages[i];
            this.avgNow = sumXNow / numPointsAveraged;
        },

        lengthOfAveragesArray: function() {
            return this.numPoints - 2 * this.halfWindowSize;
        },

        getVelocity: function() {
            return this.avgNow - this.avgBefore;
        },

        getAcceleration: function() {
            this.avgNow - 2 * this.avgMid + this.avgBefore;
        },

        getAverageMid: function() {
            return this.avgMid;
        }

    });


    /**
     * Keeps a history of 2D points and derives velocity and
     *   acceleration from that history.
     *
     * Modeled after edu.colorado.phet.ladybugmotion2d.Motion2DModel
     */
    var SamplingMotionModel = function(halfWindowSize, numPointsAveraged, x0, y0) {
        this.x = new Motion2DValue(3 * numPointsAveraged + 2 * halfWindowSize, numPointsAveraged, x0);
        this.y = new Motion2DValue(3 * numPointsAveraged + 2 * halfWindowSize, numPointsAveraged, y0);

        this.velocity = new Vector2();
        this.acceleration = new Vector2();
        this.avgMid = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(SamplingMotionModel.prototype, {

        addPointAndUpdate: function(xNow, yNow) {
            if (xNow instanceof Vector2) {
                yNow = xNow.y;
                xNow = xNow.x;
            }
            
            this.x.addPointAndUpdate(xNow);
            this.y.addPointAndUpdate(yNow);
        },

        getVelocity: function() {
            return this.velocity.set(
                this.x.getVelocity(),
                this.y.getVelocity()
            );
        },

        getAcceleration: function() {
            return this.acceleration.set(
                this.x.getAcceleration(),
                this.y.getAcceleration()
            );
        },

        getAverageMid: function() {
            return this.avgMid.set(
                this.x.getAverageMid(),
                this.y.getAverageMid()
            );
        },

        reset: function(x0, y0) {
            this.x.reset(x0);
            this.y.reset(y0);
        }

    });


    return SamplingMotionModel;
});
