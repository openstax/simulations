define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        PICTURE_A:          'picture-a-3d.png',
        PICTURE_B:          'picture-b-3d.png',
        PICTURE_C:          'picture-c-3d.png',
        PICTURE_D:          'picture-d-3d.png',
        PICTURE_A_REVERSED: 'picture-a-3d-reversed.png',
        PICTURE_B_REVERSED: 'picture-b-3d-reversed.png',
        PICTURE_C_REVERSED: 'picture-c-3d-reversed.png',
        PICTURE_D_REVERSED: 'picture-d-3d-reversed.png',
        SCREEN:             'screen-3d.png',
        LENS_FILL:          'lens-fill.png',
        LENS_OUTLINE:       'lens-outline.png',
        LAMP_RED:           'lamp-red.png',
        LAMP_BLUE:          'lamp-blue.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
