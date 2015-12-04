define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        GRAB_BAG: 'grab-bag.png',
        BULB_ON:  'bulb-on.png',
        BULB_OFF: 'bulb-off.png',
        RESISTOR: 'resistor3.png',
        BATTERY:  'battery.png',
        AC:       'ac.png',
        SWITCH_ICON: 'switch-icon.png',
        INDUCTOR: 'inductor.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
