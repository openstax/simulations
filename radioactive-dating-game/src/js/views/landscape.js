define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var PixiView           = require('common/v3/pixi/view');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var LandscapeView = PixiView.extend({

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.width = options.width;
            this.height = options.height;

            // This is a hybrid PIXI/HTML view
            this.el = document.createElement('div');
            this.$el = $(this.el);
            this.$el.addClass('landscape-buttons-wrapper');

            this.initGraphics();
            this.updateMVT(this.mvt);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.backgroundEffectsLayer = new PIXI.Container();
            this.backgroundLayer = new PIXI.Container();
            this.foregroundLayer = new PIXI.Container();
            this.foregroundEffectsLayer = new PIXI.Container();

            this.displayObject.addChild(this.backgroundEffectsLayer);
            this.displayObject.addChild(this.backgroundLayer);
            this.displayObject.addChild(this.foregroundLayer);
            this.displayObject.addChild(this.foregroundEffectsLayer);

            this.background = new PIXI.Sprite(this.getBackgroundTexture());
            this.background.anchor.y = 1;
            this.background.anchor.x = 0.5;
            this.background.y = this.height;
            this.background.x = this.width / 2;
            
            this.backgroundLayer.addChild(this.background);
        },

        getBackgroundTexture: function() {
            return PIXI.Texture.EMPTY;
        },

        reset: function() {},

        renderElement: function() {
            return this;
        },

        update: function(time, deltaTime, paused) {},

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateBackgroundScale();
        },

        updateBackgroundScale: function() {
            var targetSceneWidth = AppView.windowIsShort() ? 
                LandscapeView.SHORT_SCREEN_BACKGROUND_WIDTH : 
                LandscapeView.DEFAULT_BACKGROUND_WIDTH; // In pixels
            var scale = targetSceneWidth / this.background.width;
            this.background.scale.x = scale;
            this.background.scale.y = scale;
        },

        show: function() {
            PixiView.prototype.show.apply(this, arguments);
            this.$el.show();
        },

        hide: function() {
            PixiView.prototype.hide.apply(this, arguments);
            this.$el.hide();
        }

    }, _.extend({}, Constants.LandscapeView, {

        createMVT: function(width, height) {
            var scale = AppView.windowIsShort() ? 
                LandscapeView.SHORT_SCREEN_BACKGROUND_WIDTH / LandscapeView.BACKGROUND_IMAGE_WIDTH: 
                LandscapeView.DEFAULT_BACKGROUND_WIDTH      / LandscapeView.BACKGROUND_IMAGE_WIDTH;

            return ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),              // Model origin
                new Vector2(width / 2, height), // View origin
                scale
            );
        }

    }));


    return LandscapeView;
});