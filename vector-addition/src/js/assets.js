define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        Vector_Bin:   'vector_bin.png',
        Trash_Can:    'trash_can.png',
        Trash_Can_Open: 'trash_can_open.png'
    };

    return Assets;
});
