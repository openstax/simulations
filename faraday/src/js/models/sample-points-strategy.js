define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var Vector2 = require('common/math/vector2');
    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    var SamplePointsStrategy = {};

    var destroySamplePoints = function(pickupCoilModel) {
        if (pickupCoilModel.samplePoints) {
            for (var i = 0; i < pickupCoilModel.samplePoints.length; i++)
                vectorPool.remove(pickupCoilModel.samplePoints[i]);
        }
    };

    /**
     * A fixed number of points is distributed along a vertical line that
     *   goes through the center of a pickup coil. The number of sample
     *   points must be odd, so that one point is at the center. The points
     *   at the outer edge are guaranteed to be on the coil.
     */
    var ConstantNumberOfSamplePointsStrategy = function(numberOfSamplePoints) {
        this.numberOfSamplePoints = numberOfSamplePoints;  
    };

    /**
     * Instance functions/properties
     */
    _.extend(ConstantNumberOfSamplePointsStrategy.prototype, {

        createSamplePoints: function(pickupCoilModel) {
            var samplePoints = [];
            var numberOfSamplePointsOnRadius = (this.numberOfSamplePoints - 1) / 2;
            var samplePointsYSpacing = pickupCoilModel.get('radius') / numberOfSamplePointsOnRadius;

            // all sample points share the same x offset
            var xOffset = 0;

            // Center
            var index = 0;
            samplePoints[index++] = vectorPool.create().set(xOffset, 0);

            // Offsets below & above the center
            var y = 0;
            for (var i = 0; i < numberOfSamplePointsOnRadius; i++) {
                y += samplePointsYSpacing;
                samplePoints[index++] = vectorPool.create().set(xOffset,  y);
                samplePoints[index++] = vectorPool.create().set(xOffset, -y);
            }

            return samplePoints;
        },

        destroySamplePoints: destroySamplePoints

    });


    /**
     * A fixed spacing is used to distribute a variable number of points
     *   along a vertical line that goes through the center of a pickup coil.
     *   One point is at the center. Points will be on the edge of the coil
     *   only if the coil's radius is an integer multiple of the spacing.
     */
    var VariableNumberOfSamplePointsStrategy = function(ySpacing) {
        this.ySpacing = ySpacing;
    };

    /**
     * Instance functions/properties
     */
    _.extend(VariableNumberOfSamplePointsStrategy.prototype, {

        createSamplePoints: function(pickupCoilModel) {
            var numberOfSamplePointsOnRadius = Math.floor(pickupCoilModel.get('radius') / this.ySpacing);

            var samplePoints = [];

            // All sample points share the same x offset
            var xOffset = 0;

            // Center
            var index = 0;
            samplePoints[index++] = vectorPool.create().set(xOffset, 0);

            // Offsets below & above the center
            var y = 0;
            for (var i = 0; i < numberOfSamplePointsOnRadius; i++) {
                y += this.ySpacing;
                samplePoints[index++] = vectorPool.create().set(xOffset,  y);
                samplePoints[index++] = vectorPool.create().set(xOffset, -y);
            }

            return samplePoints;
        },

        destroySamplePoints: destroySamplePoints

    });


    SamplePointsStrategy.ConstantNumberOfSamplePointsStrategy = ConstantNumberOfSamplePointsStrategy;
    SamplePointsStrategy.VariableNumberOfSamplePointsStrategy = VariableNumberOfSamplePointsStrategy;
    

    return SamplePointsStrategy;
});
