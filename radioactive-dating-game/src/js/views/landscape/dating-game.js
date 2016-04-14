define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var LandscapeView = require('radioactive-dating-game/views/landscape');

    var Assets = require('assets');
    var Constants = require('constants');

    var SHORT_SCREEN_BACKGROUND_WIDTH = 960;
    var DEFAULT_BACKGROUND_WIDTH = 1400;

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var DatingGameLandscapeView = LandscapeView.extend({

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            LandscapeView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            LandscapeView.prototype.initGraphics.apply(this, arguments);

            // Left align this one so we always see the left edge
            this.background.anchor.x = 0;
            this.background.x = 0;
        },

        getBackgroundTexture: function() {
            return Assets.Texture(Assets.Images.DATING_GAME_BACKGROUND);
        },

        updateBackgroundScale: function() {
            var targetSceneWidth = AppView.windowIsShort() ? 
                SHORT_SCREEN_BACKGROUND_WIDTH : 
                DEFAULT_BACKGROUND_WIDTH; // In pixels
            var scale = targetSceneWidth / this.background.width;
            this.background.scale.x = scale;
            this.background.scale.y = scale;
        }

    }, {

        createMVT: function(width, height) {
            var scale = AppView.windowIsShort() ? 
                SHORT_SCREEN_BACKGROUND_WIDTH / LandscapeView.BACKGROUND_IMAGE_WIDTH: 
                DEFAULT_BACKGROUND_WIDTH      / LandscapeView.BACKGROUND_IMAGE_WIDTH;

            var x = AppView.windowIsShort() ? 130 : 0;

            return ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),            // Model origin
                new Vector2(x, height), // View origin
                scale
            );
        }

    });


    return DatingGameLandscapeView;
});