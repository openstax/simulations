define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        LASER_ON:               'laser-on',
        LASER_OFF:              'laser-off',
        INTENSITY_METER_BODY:   'intensity-meter-body',
        INTENSITY_METER_SENSOR: 'intensity-meter-sensor',
        WAVE_SENSOR_BODY:       'wave-sensor-body',
        VELOCITY_SENSOR_BODY:   'velocity-sensor-body',
        PROTRACTOR:             'protractor-white.png'
    };

    Assets.SpriteSheets = {
        'objects.json': [
            Assets.Images.LASER_ON,
            Assets.Images.LASER_OFF,
            Assets.Images.INTENSITY_METER_BODY,
            Assets.Images.INTENSITY_METER_SENSOR,
            Assets.Images.WAVE_SENSOR_BODY,
            Assets.Images.VELOCITY_SENSOR_BODY
        ]
    };

    return Assets;
});
