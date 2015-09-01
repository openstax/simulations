define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        LASER_ON:               'laser-on',
        LASER_OFF:              'laser-off',
        INTENSITY_METER_BODY:   'intensity-meter-body',
        INTENSITY_METER_SENSOR: 'intensity-meter-sensor',
        PROTRACTOR:             'protractor.png'
    };

    Assets.SpriteSheets = {
        'objects.json': [
            Assets.Images.LASER_ON,
            Assets.Images.LASER_OFF,
            Assets.Images.INTENSITY_METER_BODY,
            Assets.Images.INTENSITY_METER_SENSOR
        ]
    };

    return Assets;
});
