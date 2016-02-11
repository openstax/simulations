define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
      CIRCUITA:              'circuit-A.png',
      CIRCUITB:              'circuit-B.png',
      CIRCUITEND:            'circuit-end.png',
      CIRCUITENDLEFT:        'circuit-end-L.png',
      CIRCUITBACKGROUNDLOOP: 'background-loop.png',
      FLASHLIGHT:            'flashlight.png',
      PEBEAMCONTROL:         'photoelectric-beam-control.png',
      SLIDERKNOB:            'sliderKnob.png',
    };

    Assets.SpriteSheets = {};

    return Assets;
});
