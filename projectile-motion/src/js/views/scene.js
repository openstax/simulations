define(function(require) {

    'use strict';

    //var $        = require('jquery');
    var _         = require('underscore');
    var PIXI      = require('pixi');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var ModelViewTransform   = require('common/math/model-view-transform');
    var PixiSceneView        = require('common/pixi/view/scene');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var ProjectileMotionSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.views = [];
        },

        /**
         * Renders 
         */
        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.viewOriginX = Math.round(this.width  * Constants.SceneView.ORIGIN_X_PERCENT);
            this.viewOriginY = Math.round(this.height * Constants.SceneView.ORIGIN_Y_PERCENT);
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                10 // Scale
            );

            this.initLayers();
            this.initBackground();
        },

        initLayers: function() {
            // Create layers
            this.backLayer = new PIXI.DisplayObjectContainer();
            this.propLayer = new PIXI.DisplayObjectContainer();
            this.trajectoryLayer = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.backLayer);
            this.stage.addChild(this.propLayer);
            this.stage.addChild(this.trajectoryLayer);
        },

        initBackground: function() {
            // Sky gradient is painted in the background by css, but we can
            // Create ground gradient
            var canvas = document.createElement('canvas');
            canvas.width  = this.width;
            canvas.height = this.height - this.viewOriginY;
            var ctx = canvas.getContext('2d');

            var gradient = ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, Constants.SceneView.GROUND_COLOR_1);
            gradient.addColorStop(1, Constants.SceneView.GROUND_COLOR_2);
            
            ctx.fillStyle = gradient;
            ctx.rect(0, 0, this.width, this.height);
            ctx.fill();

            var groundSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            groundSprite.anchor.y = 1;
            groundSprite.y = this.height;

            this.backLayer.addChild(groundSprite);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            for (var i = 0; i < this.views.length; i++)
                this.views[i].update(time, deltaTime, paused, timeScale);
        },

        reset: function() {
            
        }

    });

    return ProjectileMotionSceneView;
});
