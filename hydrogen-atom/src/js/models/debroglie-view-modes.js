define(function (require) {

    'use strict';
    
    var DeBroglieViewModes = {
        BRIGHTNESS_MAGNITUDE: 0, // Magnitude of amplitude is mapped to brightness in 2D
        BRIGHTNESS:           1, // Amplitude is mapped to brightness in 2D
        RADIAL_DISTANCE:      2, // Amplitude is mapped to radial distance in 2D
        HEIGHT_3D:            3  // Amplitude is mapped to height in 3D
    };

    return DeBroglieViewModes;
});
