define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        TANK:                  'tank.png',
        TANK_LID:              'tank-lid.png',
        HOSE_CONNECTOR:        'hose-connector.png',
        PRESSURE_GAUGE:        'pressure-gauge.png',
        PRESSURE_GAUGE_NEEDLE: 'pressure-gauge-needle.png',
        PUMP_BASE:             'pump-base.png',
        PUMP_HANDLE:           'pump-handle.png',

        FLAME:  'flame.png',
        ICE:    'ice-cube-stack.png',
        FINGER: 'finger-4.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
