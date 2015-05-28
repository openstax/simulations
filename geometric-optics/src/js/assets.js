define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        PICTURE_A: 'picture-a-3d.png',
        PICTURE_B: 'picture-b-3d.png',
        PICTURE_C: 'picture-c-3d.png',
        PICTURE_D: 'picture-d-3d.png',
        SCREEN:    'screen-3d.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
