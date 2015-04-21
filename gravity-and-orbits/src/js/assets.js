define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        EARTH: 'earth.png',
        SUN: 'sun.png',
        MOON: 'moon.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
