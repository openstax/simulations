define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        LADYBUG: 'ladybug',
        LADYBUG_OPEN_WINGS: 'ladybug-open-wings'
    };

    Assets.SpriteSheets = {
        'ladybug.json': [
            Assets.Images.LADYBUG,
            Assets.Images.LADYBUG_OPEN_WINGS,
        ]
    };

    return Assets;
});
