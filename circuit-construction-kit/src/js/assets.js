define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        GRAB_BAG:          'grab-bag.png',
        BULB_ON:           'bulb-on.png',
        BULB_OFF:          'bulb-off.png',
        BULB_MASK:         'bulb-mask.png',
        RESISTOR:          'resistor.png',
        RESISTOR_MASK:     'resistor-mask.png',
        BATTERY:           'battery.png',
        BATTERY_MASK:      'battery-mask.png',
        AC:                'ac.png',
        AC_MASK:           'ac-mask.png',
        SWITCH_ICON:       'switch-icon.png',
        SWITCH_BASE:       'switch2-base.png',
        SWITCH_BASE_PIVOT: 'switch2-base-pivot.png',
        SWITCH_HANDLE:     'switch2-handle.png',
        SWITCH_MASK:       'switch2-mask.png',
        INDUCTOR:          'inductor.png',
        INDUCTOR_MASK:     'inductor-mask.png',
        ELECTRON:          'electron.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
