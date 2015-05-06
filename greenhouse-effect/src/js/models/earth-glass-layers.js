define(function (require) {

    'use strict';

    var Earth                  = require('models/earth');
    var TemperatureTransformer = require('models/temperature-transformer');

    var temperatureTransformer = new TemperatureTransformer([
        [0, 0],
        [255, 255],
        [272, 303],
        [283, 335],
        [286, 361],
        [1000, 1400]
    ]);

    var Constants = require('constants');

    var GlassLayersEarth = Earth.extend({

        /**
         * Computes the current temperature from the history of past
         *   temperatures and the current net energy and returns it.
         *   This version also "jimmies" the value according to our
         *   linear transformation values above.
         */
        computeTemperature: function() {
            var temperature = Earth.prototype.computeTemperature.apply(this, arguments);

            return temperatureTransformer.transformTemperature(temperature);
        }

    });

    return GlassLayersEarth;
});
