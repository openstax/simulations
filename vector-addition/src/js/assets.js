define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {
        VECTOR_BOX:     'vector-box.png',
        TRASH_CAN:      'garbage-bin.png',
        TRASH_CAN_OPEN: 'garbage-bin-open.png'
    };

    return Assets;
});
