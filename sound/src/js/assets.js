define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        SPEAKER_MAGNET:   'speaker-magnet.png',
        SPEAKER_CONE:     'speaker-cone.png',
        SPEAKER_SURROUND: 'speaker-surround.png',
        LISTENER_MALE:    'boy.png',
        LISTENER_FEMALE:  'girl.png',
        BOX_OUTLINE:      'box-outline.png',
        BOX_FILL:         'box-fill.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
