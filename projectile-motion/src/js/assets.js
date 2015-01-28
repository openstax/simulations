define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        CANNON:          'cannon.png',
        CANNON_CARRIAGE: 'cannon-carriage.png',
        CANNON_BALL:     'cannon-ball.png',
        FLAME_PARTICLE:  'flame-particle.png',
        SMOKE_PARTICLE:  'smoke-particle.png',
        TANK_SHELL:      'tank-shell.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
