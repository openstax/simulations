define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        GRAB_BAG:           'grab-bag.png',
        BULB_ON:            'bulb-on.png',
        BULB_OFF:           'bulb-off.png',
        BULB_MASK:          'bulb-mask.png',
        RESISTOR:           'resistor.png',
        RESISTOR_MASK:      'resistor-mask.png',
        BATTERY:            'battery.png',
        BATTERY_MASK:       'battery-mask.png',
        AC:                 'ac.png',
        AC_MASK:            'ac-mask.png',
        SWITCH_ICON:        'switch-icon.png',
        SWITCH_BASE:        'switch-base.png',
        SWITCH_BASE_PIVOT:  'switch-base-pivot.png',
        SWITCH_HANDLE:      'switch-handle.png',
        SWITCH_HANDLE_MASK: 'switch-handle-mask.png',
        SWITCH_MASK:        'switch-mask.png',
        INDUCTOR:           'inductor.png',
        INDUCTOR_MASK:      'inductor-mask.png',
        ELECTRON:           'electron.png',
        PENCIL:             'grab-bag/pencil.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
