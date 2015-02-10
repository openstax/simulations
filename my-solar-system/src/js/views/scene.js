define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var GridView           = require('common/pixi/view/grid');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var BodyView      = require('views/body');
    var BodyTraceView = require('views/body-trace');
    var CollisionView = require('views/collision');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var MSSSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            this.zoomScale = 1.2;

            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'bodies-reset',   this.initBodyViews);
            this.listenTo(this.simulation, 'collision',      this.showCollision);
            this.listenTo(this.simulation, 'change:started', this.startedChanged);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.viewOriginX = Math.round(this.width  / 2);
            this.viewOriginY = Math.round(this.height / 2);
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                this.zoomScale
            );

            this.initGridView();
            this.initBodyTraceLayer();
            this.initBodyLayer();
            this.initBodyViews(this.simulation, this.simulation.bodies);
            this.initCollisions();
        },

        initGridView: function() {
            this.gridView = new GridView({
                origin: new Vector2(this.width / 2, this.height / 2),
                bounds: new Rectangle(0, 0, this.width, this.height),
                gridSize: this.mvt.modelToViewDeltaX(Constants.SceneView.GRID_SIZE),
                lineColor: '#fff',
                lineAlpha: 0.1
            });
            this.gridView.hide();
            this.stage.addChild(this.gridView.displayObject);
        },

        initBodyLayer: function() {
            this.bodyLayer = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.bodyLayer);
        },

        initBodyTraceLayer: function() {
            this.bodyTraceLayer = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.bodyTraceLayer);
        },

        initBodyViews: function(simulation, bodies) {
            this.bodyLayer.removeChildren();
            this.bodyTraceLayer.removeChildren();
            this.bodyViews = [];
            this.bodyTraceViews = [];

            for (var i = 0; i < bodies.length; i++) {
                var bodyView = new BodyView({
                    model: bodies[i],
                    mvt: this.mvt,
                    color: Constants.BODY_COLORS[i]
                });
                this.bodyLayer.addChild(bodyView.displayObject);
                this.bodyViews.push(bodyView);

                var bodyTraceView = new BodyTraceView({
                    model: bodies[i],
                    mvt: this.mvt,
                    color: Constants.BODY_COLORS[i]
                });
                this.bodyTraceLayer.addChild(bodyTraceView.displayObject);
                this.bodyTraceViews.push(bodyTraceView);
            }
        },

        initCollisions: function() {
            this.collisionViews = [];
            this.collisionLayer = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.collisionLayer);
        },

        showCollision: function(simulation, position) {
            var collisionView = new CollisionView({
                position: position,
                mvt: this.mvt
            });
            this.collisionLayer.addChild(collisionView.displayObject);
            this.collisionViews.push(collisionView);
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

            this.gridView.setGridSize(this.mvt.modelToViewDeltaX(Constants.SceneView.GRID_SIZE));

            for (var i = this.collisionViews.length - 1; i >= 0; i--) 
                this.collisionViews[i].updateMVT(mvt);

            for (var j = this.bodyTraceViews.length - 1; j >= 0; j--)
                this.bodyTraceViews[j].updateMVT(mvt);

            for (var j = this.bodyViews.length - 1; j >= 0; j--)
                this.bodyViews[j].updateMVT(mvt);

            this.trigger('change:mvt', this, mvt);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            // Update collision views
            for (var i = this.collisionViews.length - 1; i >= 0; i--) {
                this.collisionViews[i].update(time, deltaTime, paused);

                if (this.collisionViews[i].finished()) {
                    this.collisionViews[i].removeFrom(this.collisionLayer);
                    this.collisionViews.slice(i, 1);
                }
            }

            for (var i = this.bodyTraceViews.length - 1; i >= 0; i--)
                this.bodyTraceViews[i].update(time, deltaTime, paused);
        },

        reset: function() {
            // Remove collision views
            for (var i = this.collisionViews.length - 1; i >= 0; i--) {
                this.collisionViews[i].removeFrom(this.collisionLayer);
                this.collisionViews.slice(i, 1);
            }

            // Make new body views and trace views
            this.initBodyViews(this.simulation, this.simulation.bodies);
        },

        startedChanged: function(simulation, started) {
            if (started) {
                for (var i = 0; i < this.bodyViews.length; i++)
                    this.bodyViews[i].disableInteraction();    
            }
            else {
                for (var j = 0; j < this.bodyViews.length; j++)
                    this.bodyViews[j].enableInteraction(); 
            }
        },

        showTraces: function() {
            for (var i = this.bodyTraceViews.length - 1; i >= 0; i--)
                this.bodyTraceViews[i].clear();
            this.bodyTraceLayer.visible = true;
        },

        hideTraces: function() {
            this.bodyTraceLayer.visible = false;
        }

    });

    return MSSSceneView;
});
