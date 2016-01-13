define(function (require, exports, module) {

    'use strict';

    /**
     * 
     */
    var NoiseGenerator = {

        getReadout: function(trueVoltage) {
            var maxVoltage = 10.0; // This parameter is freely chosen.

            // Cap the maximum possible noise to either 10% of the true voltage or 10% of the maximum voltage
            var maxNoise = Math.min(Math.abs(trueVoltage), maxVoltage) / 10.0;

            // Noise standard deviation is capped to 2.5% of the maximum voltage / amp
            var voltageNoise;
            if (Math.abs(trueVoltage) < maxVoltage)
                voltageNoise = Math.random() * 2.5 / 100.0 * trueVoltage;
            else
                voltageNoise = Math.random() * 2.5 / 100 * maxVoltage;

            if (voltageNoise > maxNoise)
                voltageNoise = maxNoise;
            
            if (voltageNoise < -maxNoise)
                voltageNoise = -maxNoise;
            
            var voltageDisplay = trueVoltage + voltageNoise;
            return voltageDisplay;
        }

    };

    return NoiseGenerator;
});
