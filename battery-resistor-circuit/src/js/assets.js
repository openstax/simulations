define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        PINWHEEL:       'pinwheel.png',
        BATTERY:        'battery.png',
        BATTERY_INSIDE: 'battery-inside.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
