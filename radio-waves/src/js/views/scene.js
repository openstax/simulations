define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var AppView            = require('common/app/app');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');
    var ModelViewTransform = require('common/math/model-view-transform');

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

            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xFF0000, 0.2);
            graphics.drawRect(
                this.mvt.modelToViewX(Constants.SIMULATION_BOUNDS.x),
                this.mvt.modelToViewY(Constants.SIMULATION_BOUNDS.y),
                this.mvt.modelToViewDeltaX(Constants.SIMULATION_BOUNDS.w),
                this.mvt.modelToViewDeltaY(Constants.SIMULATION_BOUNDS.h)
            );
            graphics.endFill();

            graphics.beginFill();
            graphics.drawCircle(
                this.mvt.modelToViewX(this.simulation.transmittingAntenna.end1.x),
                this.mvt.modelToViewY(this.simulation.transmittingAntenna.end1.y),
                3
            );
            graphics.drawCircle(
                this.mvt.modelToViewX(this.simulation.transmittingAntenna.end2.x),
                this.mvt.modelToViewY(this.simulation.transmittingAntenna.end2.y),
                3
            );
            graphics.endFill();

            graphics.beginFill(0xFFFFFF, 1);
            graphics.drawCircle(
                this.mvt.modelToViewX(this.simulation.receivingAntenna.end1.x),
                this.mvt.modelToViewY(this.simulation.receivingAntenna.end1.y),
                3
            );
            graphics.drawCircle(
                this.mvt.modelToViewX(this.simulation.receivingAntenna.end2.x),
                this.mvt.modelToViewY(this.simulation.receivingAntenna.end2.y),
                3
            );
            graphics.endFill();

            this.stage.addChild(graphics);
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = Constants.SIMULATION_BOUNDS;

            // ...to the usable screen space that we have
            var controlsWidth = 192;
            var margin = 20;
            var smallMargin = 13;
            var leftMargin  = AppView.windowIsShort() ? smallMargin + controlsWidth : 0;
            var rightMargin = AppView.windowIsShort() ? smallMargin + controlsWidth : 0;
            var usableScreenSpace = new Rectangle(leftMargin, 0, this.width - leftMargin - rightMargin, this.height);

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x);
            this.viewOriginY = Math.round(this.height - bounds.h * scale);

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
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
