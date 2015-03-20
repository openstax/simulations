define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        FLOOR:            'floor',
        WALL:             'wall',
        WALL_SHADOW:      'wall-shadow',
        FINISH:           'finish',
        FINISH_CLOSED:    'finish-closed',
        FINISH_WIN:       'finish-win',
        FINISH_PULSE:     'finish-pulse',
        FINISH_WIN_PULSE: 'finish-win-pulse',
        PARTICLE:         'particle'
    };

    Assets.SpriteSheets = {
        'tiles-d.json': [
            Assets.Images.FLOOR,
            Assets.Images.WALL,
            Assets.Images.WALL_SHADOW,
            Assets.Images.FINISH,
            Assets.Images.FINISH_CLOSED,
            Assets.Images.FINISH_WIN,
            Assets.Images.FINISH_PULSE,
            Assets.Images.FINISH_WIN_PULSE,
            Assets.Images.PARTICLE
        ]
    };

    return Assets;
});
