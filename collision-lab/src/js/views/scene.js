define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');
    var Vector2            = require('common/math/vector2');

    var BallView = require('views/ball');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var CollisionLabSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            options = _.extend({
                oneDimensional: false
            }, options);

            this.oneDimensional = options.oneDimensional;

            this.ballViews = [];

            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.balls, 'reset',  this.ballsReset);
            this.listenTo(this.simulation.balls, 'add',    this.ballAdded);
            this.listenTo(this.simulation.balls, 'remove', this.ballRemoved);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initBorderGraphic();
            this.initBalls();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = this.simulation.bounds;

            // ...to the usable screen space that we have
            var usableScreenSpace = new Rectangle(
                20,       // Left margin
                20 + 185, // Top margin plus ball settings matrix
                this.width - 20 - 20 - 190 - 20,
                this.height - 20 - 185 - 65 - 20
            );

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x);
            this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initBorderGraphic: function() {
            this.border = new PIXI.Graphics();
            this.border.lineStyle(3, 0xFFFFFF, 1);
            this.stage.addChild(this.border);

            this.drawBorder();
        },

        initBalls: function() {
            this.balls = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.balls);

            this.ballsReset(this.simulation.balls);
        },

        drawBorder: function() {
            if (!this.oneDimensional) {
                this.border.beginFill(0xFFFFFF, 0.25);
                this.border.drawRect(
                    this.mvt.modelToViewX(this.simulation.bounds.x),
                    this.mvt.modelToViewY(this.simulation.bounds.y),
                    this.mvt.modelToViewDeltaX(this.simulation.bounds.w),
                    this.mvt.modelToViewDeltaY(this.simulation.bounds.h)
                );
                this.border.endFill();
            }
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        ballsReset: function(balls) {
            // Remove old ball views
            for (var i = this.ballViews.length - 1; i >= 0; i--) {
                this.ballViews[i].removeFrom(this.balls);
                this.ballViews.splice(i, 1);
            }

            // Add new ball views
            balls.each(function(ball) {
                this.createAndAddBallView(ball);
            }, this);
        },

        ballAdded: function(ball, balls) {
            this.createAndAddBallView(ball);
        },

        ballRemoved: function(ball, balls) {
            for (var i = this.ballViews.length - 1; i >= 0; i--) {
                if (this.ballViews[i].model === ball) {
                    this.ballViews[i].removeFrom(this.balls);
                    this.ballViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddBallView: function(ball) {
            var ballView = new BallView({ 
                model: ball,
                mvt: this.mvt,
                simulation: this.simulation
            });
            this.balls.addChild(ballView.displayObject);
            this.ballViews.push(ballView);

            if (this.velocityArrowsVisible)
                ballView.showVelocityArrow();
            else
                ballView.hideVelocityArrow();

            if (this.momentumArrowsVisible)
                ballView.showMomentumArrow();
            else
                ballView.hideMomentumArrow();
        },

        showVelocityArrows: function() {
            this.velocityArrowsVisible = true;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].showVelocityArrow();
        },

        hideVelocityArrows: function() {
            this.velocityArrowsVisible = false;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].hideVelocityArrow();
        },

        showMomentumArrows: function() {
            this.momentumArrowsVisible = true;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].showMomentumArrow();
        },

        hideMomentumArrows: function() {
            this.momentumArrowsVisible = false;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].hideMomentumArrow();
        }

    });

    return CollisionLabSceneView;
});
