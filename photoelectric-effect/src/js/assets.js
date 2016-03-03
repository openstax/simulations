define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        WIRES:                   'wires.png',
        PLATE:                   'plate.png',
        BATTERY:                 'battery.png',
        CIRCUIT_A:               'circuit-A.png',
        CIRCUIT_B:               'circuit-B.png',
        CIRCUIT_END:             'circuit-end.png',
        CIRCUIT_END_LEFT:        'circuit-end-L.png',
        CIRCUIT_BACKGROUND_LOOP: 'background-loop.png',
        FLASHLIGHT:              'flashlight.png',

        // Going to get rid of this in a bit
        PEBEAMCONTROL:         'photoelectric-beam-control.png',
        SLIDERKNOB:            'sliderKnob.png',
    };

    Assets.SpriteSheets = {};

    return Assets;

});
