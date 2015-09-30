define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        PINWHEEL:       'pinwheel.png',
        BATTERY:        'battery.png',
        BATTERY_INSIDE: 'battery-inside.png',
        ELECTRON:       'electron.png',
        ELECTRON_GLOW:  'electron-glow.png',
        SPECTRUM:       'spectrum.png',
        CORE:           'core.png',
        AMMETER_BOX:    'ammeter-box.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
