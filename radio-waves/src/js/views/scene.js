define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');
    var AppView       = require('common/app/app');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var RadioWavesSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initBackground();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = Constants.MODEL_BOUNDS;

            // ...to the usable screen space that we have
            // var controlsWidth = 180;
            // var margin = 20;
            // var leftMargin = AppView.windowIsShort() ? margin + controlsWidth + margin : margin;
            // var rightMargin = margin + controlsWidth + margin;
            // var usableScreenSpace = new Rectangle(leftMargin, 0, this.width - leftMargin - rightMargin, this.height);

            // var boundsRatio = bounds.w / bounds.h;
            // var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            // var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            // this.viewOriginX = Math.round(usableScreenSpace.x + usableScreenSpace.w / 2);
            // this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h);

            // this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
            //     new Vector2(0, 0),
            //     new Vector2(this.viewOriginX, this.viewOriginY),
            //     scale
            // );
        },

        initBackground: function() {
            var bg = Assets.createSprite(Assets.Images.BACKGROUND);
            bg.anchor.y = 1;
            bg.anchor.x = 0.5;
            bg.y = this.height;
            bg.x = this.width / 2;
            this.stage.addChild(bg);

            this.bg = bg;
            this.updateBackgroundScale();
        },

        resize: function() {
            PixiSceneView.prototype.resize.apply(this, arguments);

            if (this.bg) {
                this.updateBackgroundScale();
                this.bg.y = this.height;
            }
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        updateBackgroundScale: function() {
            var targetBackgroundWidth = AppView.windowIsShort() ? this.width : this.bg.texture.width; // In pixels
            var scale = targetBackgroundWidth / this.bg.texture.width;
            this.bg.scale.x = scale;
            this.bg.scale.y = scale;
        },

    });

    return RadioWavesSceneView;
});
