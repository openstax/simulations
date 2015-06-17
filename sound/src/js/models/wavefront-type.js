define(function (require) {

    'use strict';

    var WavefrontType = {};

    WavefrontType.Spherical = {};
    WavefrontType.Spherical.computeAmplitudeAtDistance = function(wavefront, amplitude, distance) {
        var amplitudes = wavefront.getAmplitude();
        var factor = 1 - (0.05 * distance / amplitudes.length);

        return amplitude * factor;
    };

    WavefrontType.Plane = {};
    WavefrontType.Plane.computeAmplitudeAtDistance = function(wavefront, amplitude, distance) {
        return amplitude;
    };

    return WavefrontType;
});