define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        BAR_MAGNET:  'bar-magnet-plain.png',
        ELECTRON_BG: 'electron_background.png',
        ELECTRON_FG: 'electron_foreground.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
