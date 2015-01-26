define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        CANNON:          'cannon.png',
        CANNON_CARRIAGE: 'cannon-carriage.png',
        FLAME_PARTICLE:  'flame-particle.png',
        SMOKE_PARTICLE:  'smoke-particle.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
