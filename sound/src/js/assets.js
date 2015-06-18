define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        SPEAKER_MAGNET:   'speaker-magnet.png',
        SPEAKER_CONE:     'speaker-cone.png',
        SPEAKER_SURROUND: 'speaker-surround.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
