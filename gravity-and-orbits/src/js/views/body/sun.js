define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var BodyView = require('views/body');

    var Assets = require('assets');

    /**
     * A view that represents a sun.
     */
    var SunView = BodyView.extend({

        textureBodyWidthRatio: 0.78

    });

    return SunView;
});