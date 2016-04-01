define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        SPHERE:             'sphere.png',
        CANISTER_BG:        'canister-bg.png',
        CANISTER_FG:        'canister-fg.png',
        CANISTER_SLIDER_FG: 'canister-slider-fg.png',
        CANISTER_GLOW:      'canister-glow.png',
        CANISTER_ADD:       'canister-add.png',
        CANISTER_REMOVE:    'canister-remove.png',
        CANISTER_DRAG:      'canister-drag.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
