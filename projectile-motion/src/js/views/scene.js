define(function(require) {

    'use strict';

    //var $        = require('jquery');
    var _         = require('underscore');
    var PIXI      = require('pixi');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var Colors    = require('common/colors/colors');

    var ModelViewTransform = require('common/math/model-view-transform');
    var PixiSceneView      = require('common/pixi/view/scene');

    var CannonView      = require('views/cannon');
    var TargetView      = require('views/target');
    var DavidView       = require('views/david');
    var TrajectoryView  = require('views/trajectory');
    var ProjectileView  = require('views/projectile');
    var TankShellView   = require('views/projectile/tank-shell');
    var GolfballView    = require('views/projectile/golfball');
    var BaseballView    = require('views/projectile/baseball');
    var BowlingballView = require('views/projectile/bowlingball');
    var FootballView    = require('views/projectile/football');
    var PumpkinView     = require('views/projectile/pumpkin');
    var AdultHumanView  = require('views/projectile/adult-human');
    var PianoView       = require('views/projectile/piano');
    var BuickView       = require('views/projectile/buick');

    var ProjectileViews = [
        TankShellView,
        GolfballView,
        BaseballView,
        BowlingballView,
        FootballView,
        PumpkinView,
        AdultHumanView,
        PianoView,
        BuickView
    ];

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

            this.zoomScale = 27;

            this.listenTo(this.simulation, 'projectile-launched', this.projectileLaunched);
            this.listenTo(this.simulation, 'change:currentTrajectory',   this.trajectoryAdded);
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
            this.initTarget();
            this.initDavid();
        },

        initLayers: function() {
            // Create layers
            this.backLayer       = new PIXI.DisplayObjectContainer();
            this.propLayer       = new PIXI.DisplayObjectContainer();
            this.trajectoryLayer = new PIXI.DisplayObjectContainer();
            this.projectileLayer = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.backLayer);
            this.stage.addChild(this.propLayer);
            this.stage.addChild(this.trajectoryLayer);
            this.stage.addChild(this.projectileLayer);
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
        },

        initProjectiles: function() {
            this.projectileViews = [];
        },

        initTarget: function() {
            this.targetView = new TargetView({
                model: this.simulation.target,
                mvt: this.mvt
            });
            this.backLayer.addChild(this.targetView.displayObject);
        },

        initDavid: function() {
            this.davidView = new DavidView({
                model: this.simulation.david,
                mvt: this.mvt
            });
            this.backLayer.addChild(this.davidView.displayObject);
        },

        projectileLaunched: function(projectile) {
            var projectileViewClass = ProjectileView;
            _.each(ProjectileViews, function(View) {
                if (projectile instanceof View.getModelClass()) {
                    projectileViewClass = View;
                    return false;
                }
            });

            var projectileView = new projectileViewClass({
                model: projectile,
                mvt: this.mvt
            });

            this.listenTo(projectile, 'destroy', function() {
                projectileView.removeFrom(this.projectileLayer);
                var index = _.indexOf(this.projectileViews, projectileView);
                this.projectileViews.splice(index, 0);
            });

            this.projectileViews.push(projectileView);
            this.projectileLayer.addChild(projectileView.displayObject);
        },

        trajectoryAdded: function(simulation, trajectory) {
            if (!trajectory)
                return;

            var trajectoryView = new TrajectoryView({
                model: trajectory,
                mvt: this.mvt
            });

            this.trajectoryViews.push(trajectoryView);
            this.trajectoryLayer.addChild(trajectoryView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.cannonView.update(time, deltaTime, paused);
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
                this.updateMVTs();
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
                this.updateMVTs();
            }
        },

        updateMVTs: function() {
            var mvt = this.mvt;

            this.cannonView.updateMVT(mvt);
            this.targetView.updateMVT(mvt);
            this.davidView.updateMVT(mvt);

            for (i = this.projectileViews.length - 1; i >= 0; i--)
                this.projectileViews[i].updateMVT(mvt);

            for (i = this.trajectoryViews.length - 1; i >= 0; i--)
                this.trajectoryViews[i].updateMVT(mvt);

            this.trigger('change:mvt', this, mvt);
        },

        clearShots: function() {
            var i;
            for (i = this.projectileViews.length - 1; i >= 0; i--) {
                this.projectileViews[i].removeFrom(this.projectileLayer);
                this.projectileViews.splice(i, 1);
            }

            for (i = this.trajectoryViews.length - 1; i >= 0; i--) {
                this.trajectoryViews[i].removeFrom(this.trajectoryLayer);
                this.trajectoryViews.splice(i, 1);
            }
        }

    });

    return ProjectileMotionSceneView;
});
