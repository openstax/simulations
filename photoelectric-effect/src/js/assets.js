define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        WIRES:      'wires.png',
        ELECTRODE:  'electrode.png',
        BATTERY:    'battery.png',
        FLASHLIGHT: 'flashlight.png',
        PHOTON:     'photon.png'
    };

    Assets.SpriteSheets = {};

    return Assets;

});
