define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        BAR_MAGNET:            'bar-magnet-alternate.png',
        ELECTRON_BG:           'electron_background.png',
        ELECTRON_FG:           'electron_foreground.png',

        BATTERY:               'battery.png',
        AC_POWER_SUPPLY:       'ac-power-supply.png',
        
        LIGHTBULB_BULB:        'lightbulb-glass.png',
        LIGHTBULB_CAP:         'lightbulb-cap.png',
        LIGHTBULB_BASE:        'lightbulb-base.png',

        VOLTMETER:             'voltmeter.png',
        VOLTMETER_PROBE_BLACK: 'voltmeter-probe-black.png',
        VOLTMETER_PROBE_WHITE: 'voltmeter-probe-white.png',
        VOLTMETER_RESISTOR:    'resistor.png',

        ICON_AC_POWER:         'ac-power-supply-icon.png',
        ICON_BATTERY:          'battery-icon.png',
        ICON_LIGHTBULB:        'lightbulb-icon.png',
        ICON_VOLTMETER:        'voltmeter-icon.png',

        TURBINE_PIVOT:         'turbine-pivot.png',
        WATER_WHEEL:           'water-wheel.png',
        FAUCET:                'faucet.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
