define(function (require) {

    'use strict';

    var WaveFunction = {};

    WaveFunction.SineWaveFunction = function(wavefront) {
        return function(time) {
            var amplitude = 0.0;
            if (wavefront.get('frequency') !== 0)
                amplitude = Math.sin( wavefront.get('frequency') * time ) * wavefront.get('maxAmplitude');
            else
                amplitude = 0;
            return amplitude;
        };
    };

    return WaveFunction;
});