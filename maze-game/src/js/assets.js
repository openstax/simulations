define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        FLOOR:       'floor',
        WALL:        'wall',
        WALL_SHADOW: 'wall-shadow',
        FINISH:      'finish',
        PARTICLE:    'particle'
    };

    Assets.SpriteSheets = {
        'tiles-b.json': [
            Assets.Images.FLOOR,
            Assets.Images.WALL,
            Assets.Images.WALL_SHADOW,
            Assets.Images.FINISH,
            Assets.Images.PARTICLE
        ]
    };

    return Assets;
});
