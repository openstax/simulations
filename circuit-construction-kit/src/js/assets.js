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
        DOG:                'grab-bag/dog.png',
        DOG_MASK:           'grab-bag/dog-mask.png',
        DOLLAR:             'grab-bag/dollar.png',
        DOLLAR_MASK:        'grab-bag/dollar-mask.png',
        ERASER:             'grab-bag/eraser.png',
        ERASER_MASK:        'grab-bag/eraser-mask.png',
        HAND:               'grab-bag/hand.png',
        HAND_MASK:          'grab-bag/hand-mask.png',
        PAPER_CLIP:         'grab-bag/paper-clip.png',
        PAPER_CLIP_MASK:    'grab-bag/paper-clip-mask.png',
        PENCIL:             'grab-bag/pencil.png',
        PENCIL_MASK:        'grab-bag/pencil-mask.png',
        PENNY:              'grab-bag/penny.png',
        PENNY_MASK:         'grab-bag/penny-mask.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
