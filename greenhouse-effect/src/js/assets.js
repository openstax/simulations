define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        PHOTON_SUNLIGHT: 'phet/thin2.png',
        PHOTON_INFRARED: 'phet/photon-660.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
