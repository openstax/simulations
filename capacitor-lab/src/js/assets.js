define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
       BATTERY_UP:   'battery-up.png',
       BATTERY_DOWN: 'battery-down.png',
       VOLTMETER:    'voltmeter.png',
       PROBE_RED:    'probe-red.png',
       PROBE_BLACK:  'probe-black.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
