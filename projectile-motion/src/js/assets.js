define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        CANNON:          'cannon.png',
        CANNON_CARRIAGE: 'cannon-carriage.png',
        GRASS_BLADES:    'grass-blades.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
