define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        BACKGROUND: 'background.png',
        ELECTRON:   'electron-purple.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
