define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var LandscapeView = require('radioactive-dating-game/views/landscape');

    var Assets = require('assets');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var TreeLandscapeView = LandscapeView.extend({

        getBackgroundTexture: function() {
            return Assets.Texture(Assets.Images.MEASUREMENT_BACKGROUND);
        }

    });


    return TreeLandscapeView;
});