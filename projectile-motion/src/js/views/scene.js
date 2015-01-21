define(function(require) {

    'use strict';

    //var $        = require('jquery');
    var _         = require('underscore');
    var PIXI      = require('pixi');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var Colors    = require('common/colors/colors');

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
            // Create the ground
            var ground = new PIXI.Graphics();
            ground.y = this.viewOriginY;
            ground.beginFill(Colors.parseHex(Constants.SceneView.GROUND_COLOR), 1);
            ground.drawRect(0, 0, this.width, this.height - this.viewOriginY);
            ground.endFill();

            this.backLayer.addChild(ground);
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
