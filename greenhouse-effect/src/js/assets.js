define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        PHOTON_SUNLIGHT: 'phet/thin2.png',
        PHOTON_INFRARED: 'phet/photon-660.png',
        PHOTON_EMITTER_SUNLIGHT: 'phet/flashlight2.png',
        PHOTON_EMITTER_INFRARED: 'phet/heat-lamp.png',

        SCENE_ICE_AGE: 'scene-ice-age.png',
        SCENE_1750:    'scene-1750.png',
        SCENE_TODAY:   'scene-today.png',
        SCENE_GLASS:   'scene-glass.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
