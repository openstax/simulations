define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        FLOOR_1:     'floor1',
        FLOOR_2:     'floor2',
        FLOOR_3:     'floor3',
        WALL:        'wall',
        WALL_SHADOW: 'wall-shadow',
        FINISH:      'finish',
        PARTICLE:    'particle'
    };

    Assets.SpriteSheets = {
        'tiles.json': [
            Assets.Images.FLOOR_1,
            Assets.Images.FLOOR_2,
            Assets.Images.FLOOR_3,
            Assets.Images.WALL,
            Assets.Images.WALL_SHADOW,
            Assets.Images.FINISH,
            Assets.Images.PARTICLE
        ]
    };

    return Assets;
});
