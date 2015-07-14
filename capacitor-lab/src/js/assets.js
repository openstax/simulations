define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
       BATTERY_UP:   'battery-up.png',
       BATTERY_DOWN: 'battery-down.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
