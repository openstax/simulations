define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var AppView            = require('common/app/app');
    var Colors             = require('common/colors/colors');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');
    var ModelViewTransform = require('common/math/model-view-transform');

    var SourceObjectView = require('views/source-object');
    var TargetImageView  = require('views/target-image');
    var LensView         = require('views/lens');
    var RaysView         = require('views/rays');
    var ScreenView       = require('views/screen');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');
    var AXIS_COLOR = Colors.parseHex(Constants.SceneView.AXIS_COLOR);

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var GeometricOpticsSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.lens, 'change:position', this.drawAxis);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.backLayer   = new PIXI.DisplayObjectContainer();
            this.objectsLayer = new PIXI.DisplayObjectContainer();
            this.raysLayer   = new PIXI.DisplayObjectContainer();
            this.axisLayer   = new PIXI.DisplayObjectContainer();
            this.frontLayer  = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.backLayer);
            this.stage.addChild(this.objectsLayer);
            this.stage.addChild(this.raysLayer);
            this.stage.addChild(this.axisLayer);
            this.stage.addChild(this.frontLayer);

            this.initMVT();
            this.initObjects();
            this.initRays();
            this.initAxis();
            this.initScreen();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var simWidth  = Constants.MIN_SCENE_WIDTH;
            var simHeight = Constants.MIN_SCENE_HEIGHT;

            // ...to the usable screen space that we have
            var usableScreenSpace
            if (AppView.windowIsShort())
                usableScreenSpace = new Rectangle(0, 0, this.width - 205, this.height);
            else
                usableScreenSpace = new Rectangle(0, 116, this.width, this.height - 116);

            var simRatio = simWidth / simHeight;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > simRatio) ? usableScreenSpace.h / simHeight : usableScreenSpace.w / simWidth;
            
            this.viewOriginX = Math.round(usableScreenSpace.x + usableScreenSpace.w / 2);
            this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initObjects: function() {
            this.sourceObjectView = new SourceObjectView({
                model: this.simulation.sourceObject,
                mvt: this.mvt
            });
            this.objectsLayer.addChild(this.sourceObjectView.displayObject);

            this.targetImageView = new TargetImageView({
                model: this.simulation.targetImage,
                mvt: this.mvt
            });
            this.objectsLayer.addChild(this.targetImageView.displayObject);

            this.lensView = new LensView({
                model: this.simulation.lens,
                mvt: this.mvt
            });
            this.objectsLayer.addChild(this.lensView.displayObject);
        },

        initAxis: function() {
            this.axis = new PIXI.Graphics();
            this.axisLayer.addChild(this.axis);
            this.drawAxis();
        },

        drawAxis: function() {
            this.axis.clear();
            this.axis.lineStyle(GeometricOpticsSceneView.AXIS_WIDTH, AXIS_COLOR, GeometricOpticsSceneView.AXIS_ALPHA);
            this.axis.moveTo(0,          this.mvt.modelToViewY(this.simulation.lens.get('position').y));
            this.axis.lineTo(this.width, this.mvt.modelToViewY(this.simulation.lens.get('position').y));
        },

        initRays: function() {
            this.raysView = new RaysView({
                model: this.simulation,
                mvt: this.mvt,
                lensView: this.lensView
            });
            this.raysLayer.addChild(this.raysView.displayObject);
        },

        initScreen: function() {
            this.screenView = new ScreenView({
                model: this.simulation.targetImage,
                mvt: this.mvt,
                lensView: this.lensView
            });

            this.backLayer.addChild(this.screenView.backLayer);
            this.frontLayer.addChild(this.screenView.frontLayer);

            this.screenView.setPosition(
                this.mvt.modelToViewX(Constants.MIN_SCENE_WIDTH * 0.32),
                this.mvt.modelToViewY(0)
            );
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        showSecondPoint: function() {
            this.sourceObjectView.showSecondPoint();
            this.raysView.showSecondPoint();
        },

        hideSecondPoint: function() {
            this.sourceObjectView.hideSecondPoint();
            this.raysView.hideSecondPoint();
        },

        setRaysMode: function(mode) {
            this.raysView.setMode(mode);
        },

        showVirtualImage: function() {
            this.raysView.showVirtualImage();
            this.targetImageView.showVirtualImage();
        },

        hideVirtualImage: function() {
            this.raysView.hideVirtualImage();
            this.targetImageView.hideVirtualImage();
        },

        showGuides: function() {
            this.raysView.showGuides();
        },

        hideGuides: function() {
            this.raysView.hideGuides();
        }

    }, Constants.SceneView);

    return GeometricOpticsSceneView;
});
