define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        SPHERE: 'sphere.png',
        PHOTON: 'photon.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
