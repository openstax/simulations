define(function (require) {

    'use strict';

    var PIXI = require('pixi');

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        GRAB_BAG:              'grab-bag.png',
        SCHEMATIC_GRAB_BAG:    'grab-bag-schematic.png',
        ELECTRON:              'electron-dark.png',
        VOLTMETER:             'voltmeter.png',
        VOLTMETER_PROBE_BLACK: 'voltmeter-probe-black.png',
        VOLTMETER_PROBE_RED:   'voltmeter-probe-red.png',

        BULB_ON:            'components/normal/bulb-on.png',
        BULB_OFF:           'components/normal/bulb-off.png',
        BULB_MASK:          'components/normal/bulb-mask.png',
        BULB_GLOW:          'components/normal/bulb-glow.png',
        RESISTOR:           'components/normal/resistor.png',
        RESISTOR_MASK:      'components/normal/resistor-mask.png',
        BATTERY:            'components/normal/battery.png',
        BATTERY_MASK:       'components/normal/battery-mask.png',
        AC:                 'components/normal/ac.png',
        AC_MASK:            'components/normal/ac-mask.png',
        SERIES_AMMETER:     'components/normal/series-ammeter.png',
        SERIES_AMMETER_TOP: 'components/normal/series-ammeter-top.png',
        SERIES_AMMETER_MASK:'components/normal/series-ammeter-mask.png',
        SERIES_AMMETER_ICON:'components/normal/series-ammeter-icon.png',
        SWITCH_ICON:        'components/normal/switch-icon.png',
        SWITCH_BASE:        'components/normal/switch-base.png',
        SWITCH_BASE_PIVOT:  'components/normal/switch-base-pivot.png',
        SWITCH_HANDLE:      'components/normal/switch-handle.png',
        SWITCH_HANDLE_MASK: 'components/normal/switch-handle-mask.png',
        SWITCH_MASK:        'components/normal/switch-mask.png',
        INDUCTOR:           'components/normal/inductor.png',
        INDUCTOR_MASK:      'components/normal/inductor-mask.png',
        CAPACITOR:          'components/normal/capacitor.png',
        CAPACITOR_MASK:     'components/normal/capacitor-mask.png',

        SCHEMATIC_BULB_ON:            'components/schematic/bulb-on.png',
        SCHEMATIC_BULB_OFF:           'components/schematic/bulb-off.png',
        SCHEMATIC_BULB_MASK:          'components/schematic/bulb-mask.png',
        SCHEMATIC_RESISTOR:           'components/schematic/resistor.png',
        SCHEMATIC_RESISTOR_MASK:      'components/schematic/resistor-mask.png',
        SCHEMATIC_LARGE_RESISTOR:     'components/schematic/resistor-large.png',
        SCHEMATIC_LARGE_RESISTOR_MASK:'components/schematic/resistor-large-mask.png',
        SCHEMATIC_BATTERY:            'components/schematic/battery.png',
        SCHEMATIC_BATTERY_MASK:       'components/schematic/battery-mask.png',
        SCHEMATIC_AC:                 'components/schematic/ac.png',
        SCHEMATIC_AC_MASK:            'components/schematic/ac-mask.png',
        SCHEMATIC_SERIES_AMMETER:     'components/schematic/series-ammeter.png',
        SCHEMATIC_SERIES_AMMETER_MASK:'components/schematic/series-ammeter-mask.png',
        SCHEMATIC_SWITCH_ICON:        'components/schematic/switch-icon.png',
        SCHEMATIC_SWITCH_BASE:        'components/schematic/switch-base.png',
        SCHEMATIC_SWITCH_MASK:        'components/schematic/switch-mask.png',
        SCHEMATIC_SWITCH_HANDLE:      'components/schematic/switch-handle.png',
        SCHEMATIC_SWITCH_HANDLE_MASK: 'components/schematic/switch-handle-mask.png',
        SCHEMATIC_INDUCTOR:           'components/schematic/inductor.png',
        SCHEMATIC_INDUCTOR_MASK:      'components/schematic/inductor-mask.png',
        SCHEMATIC_CAPACITOR:          'components/schematic/capacitor.png',
        SCHEMATIC_CAPACITOR_MASK:     'components/schematic/capacitor-mask.png',
        
        DOG:                'components/grab-bag/dog.png',
        DOG_MASK:           'components/grab-bag/dog-mask.png',
        DOLLAR:             'components/grab-bag/dollar.png',
        DOLLAR_MASK:        'components/grab-bag/dollar-mask.png',
        ERASER:             'components/grab-bag/eraser.png',
        ERASER_MASK:        'components/grab-bag/eraser-mask.png',
        HAND:               'components/grab-bag/hand.png',
        HAND_MASK:          'components/grab-bag/hand-mask.png',
        PAPER_CLIP:         'components/grab-bag/paper-clip.png',
        PAPER_CLIP_MASK:    'components/grab-bag/paper-clip-mask.png',
        PENCIL:             'components/grab-bag/pencil.png',
        PENCIL_MASK:        'components/grab-bag/pencil-mask.png',
        PENNY:              'components/grab-bag/penny.png',
        PENNY_MASK:         'components/grab-bag/penny-mask.png',

        FLAME_1: 'flame_a_0001.png',
        FLAME_2: 'flame_a_0002.png',
        FLAME_3: 'flame_a_0003.png',
        FLAME_4: 'flame_a_0004.png',
        FLAME_5: 'flame_a_0005.png',
        FLAME_6: 'flame_a_0006.png'
    };

    Assets.SpriteSheets = {
        'flame.json': [
            Assets.Images.FLAME_1,
            Assets.Images.FLAME_2,
            Assets.Images.FLAME_3,
            Assets.Images.FLAME_4,
            Assets.Images.FLAME_5,
            Assets.Images.FLAME_6
        ]
    };

    Assets.Animations = {
        FLAME: Assets.SpriteSheets['flame.json']
    };

    Assets.createMovieClip = function(imagePaths) {
        var textures = [];
        for (var i = 0; i < imagePaths.length; i++)
            textures.push(Assets.Texture(imagePaths[i]));
        return new PIXI.extras.MovieClip(textures);
    };

    return Assets;
});
