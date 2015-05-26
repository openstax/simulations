define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * For transforming a temperature according to a system
     *   of linear equations.  The TemperatureTransformer
     *   will use multiple instances of this object to 
     *   transform temperature values with a wider range
     *   than one pair of equations would give.
     */
    var TemperatureTransform = function(fromValue1, fromValue2, toValue1, toValue2) {
        this.fromMin = fromValue1;
        this.toMin   = toValue1;
        this.m = (toValue2 - toValue1) / (fromValue2 - fromValue1);
    };

    /**
     * Instance functions/properties
     */
    _.extend(TemperatureTransform.prototype, {

        /**
         * Transforms a temperature value
         */
        transformTemperature: function(temperature) {
            return Math.floor(this.toMin + this.m * (temperature - this.fromMin));
        }

    });

    /**
     * Used to transform temperature values based on a series
     *   of linear equations.  In the original PhET source,
     *   this was referred to as "jimmying" the temperature
     *   values.  This functionality was extracted out of the
     *   original Earth class.  It was placed here to make it
     *   easier to read and understand.
     */
    var TemperatureTransformer = function(temperatureTransformationValues) {
        this.transformationValues = temperatureTransformationValues;
        this.transforms = [];
        for (var i = 0; i < temperatureTransformationValues.length - 1; i++) {
            this.transforms[i] = new TemperatureTransform(
                temperatureTransformationValues[i][0], temperatureTransformationValues[i + 1][0],
                temperatureTransformationValues[i][1], temperatureTransformationValues[i + 1][1]
            );
        }
    };

    /**
     * Instance functions/properties
     */
    _.extend(TemperatureTransformer.prototype, {

        /**
         * Transforms a temperature value
         */
        transformTemperature: function(temperature) {
            var transform = null;
            for (var i = 0; i < this.transformationValues.length - 1; i++) {
                // Note: These statements are exactly the same, but this is
                //   how it was in the source code, so I believe this must
                //   have been a bug.  They weren't stacked on top of each
                //   other like I've done here to be able to see with the
                //   naked eye that the statemetns are exactly identical.
                if (temperature >= this.transformationValues[i][0] && 
                    temperature >= this.transformationValues[i][0]) {
                    transform = this.transforms[i];
                }
            }

            if (!transform)
                throw 'No temperature transform found.';
            
            return transform.transformTemperature(temperature);
        }

    });


    return TemperatureTransformer;
});
