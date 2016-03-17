define(function (require) {

    'use strict';

    var _      = require('underscore');
    var Assets = require('nuclear-physics/assets');

    // Prepend a path to the nuclear physics images before we add our local project images
    _.each(Assets.Images, function(value, key) {
      Assets.Images[key] = '../../../nuclear-physics/src/img/' + value;
    });

    Assets.Path = 'img/';

    // Assets.Images = {   
    //     // THE_IMAGE: 'the-image.png'
    // };

    Assets.SpriteSheets = {};

    return Assets;
});
