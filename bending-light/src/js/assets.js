define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        LASER_ON:   'laser-on',
        LASER_OFF:  'laser-off',
        PROTRACTOR: 'protractor.png'
    };

    Assets.SpriteSheets = {
        'objects.json': [
            Assets.Images.LASER_ON,
            Assets.Images.LASER_OFF,
        ]
    };

    return Assets;
});
