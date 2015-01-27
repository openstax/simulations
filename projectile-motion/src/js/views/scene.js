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

    var CannonView     = require('views/cannon');
    var ProjectileView = require('views/projectile');

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

            this.zoomScale = 40;

            this.listenTo(this.simulation, 'projectile-launched', this.projectileLaunched);
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
                this.zoomScale // Scale, meters to pixels
            );

            this.initLayers();
            this.initBackground();
            this.initCannon();
            this.initTrajectories();
            this.initProjectiles();
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
            var groundY = Math.round(this.height * 0.82);
            var ground = new PIXI.Graphics();
            ground.y = groundY;
            ground.beginFill(Colors.parseHex(Constants.SceneView.GROUND_COLOR), 1);
            ground.drawRect(0, 0, this.width, this.height  - groundY);
            ground.endFill();

            this.backLayer.addChild(ground);
        },

        initCannon: function() {
            var cannonView = new CannonView({
                model: this.simulation.cannon,
                mvt: this.mvt
            });
            this.cannonView = cannonView;
            this.propLayer.addChild(cannonView.displayObject);
        },

        initTrajectories: function() {
            this.trajectoryViews = [];

            this.trajectoryLayer = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.trajectoryLayer);
        },

        initProjectiles: function() {
            this.projectileViews = [];

            this.projectileLayer = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.projectileLayer);
        },

        projectileLaunched: function(projectile) {
            var projectileView = new ProjectileView({
                model: projectile,
                mvt: this.mvt
            });
            this.projectileViews.push(projectileView);
            this.stage.addChild(projectileView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.cannonView.update(time, deltaTime, paused);
        },

        reset: function() {
            
        },

        zoomIn: function() {
            var zoom = this.zoomScale * 1.5;
            if (zoom < Constants.SceneView.MAX_SCALE) {
                this.zoomScale = zoom;
                this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                    new Vector2(0, 0),
                    new Vector2(this.viewOriginX, this.viewOriginY),
                    this.zoomScale // Scale, meters to pixels
                );
                this.cannonView.updateMVT(this.mvt);
            }
        },

        zoomOut: function() {
            var zoom = this.zoomScale / 1.5;
            if (zoom > Constants.SceneView.MIN_SCALE) {
                this.zoomScale = zoom;
                this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                    new Vector2(0, 0),
                    new Vector2(this.viewOriginX, this.viewOriginY),
                    this.zoomScale // Scale, meters to pixels
                );
                this.cannonView.updateMVT(this.mvt);
            }
        }

    });

    return ProjectileMotionSceneView;
});
