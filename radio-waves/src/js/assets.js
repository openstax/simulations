define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        BACKGROUND: 'background.png',
        ELECTRON:   'electron-purple.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
