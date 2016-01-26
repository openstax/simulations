define(function (require) {

    'use strict';

    var _      = require('underscore');
    var Assets = require('nuclear-physics/assets');

    Assets.Path = 'img/';

    // Add our local project images
    _.extend(Assets.Images, require('./assets-images'));

    return Assets;
});
