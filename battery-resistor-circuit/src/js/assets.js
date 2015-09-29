define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        PINWHEEL:       'pinwheel.png',
        BATTERY:        'battery.png',
        BATTERY_INSIDE: 'battery-inside.png',
        ELECTRON:       'electron.png',
        SPECTRUM:       'spectrum.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
