define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var LaserView     = require('views/laser');
    var LaserBeamView = require('views/laser-beam');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var BendingLightSceneView = PixiSceneView.extend({

        initialize: function(options) {
            options = _.extend({
                centerOffsetLeft: 0
            }, options);

            this.centerOffsetLeft = options.centerOffsetLeft;
            this.showingNormal = false;

            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.bottomLayer    = new PIXI.DisplayObjectContainer();
            this.lightRayLayer  = new PIXI.DisplayObjectContainer();
            this.lightWaveLayer = new PIXI.DisplayObjectContainer();
            this.middleLayer    = new PIXI.DisplayObjectContainer();
            this.topLayer       = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.bottomLayer);
            this.stage.addChild(this.lightRayLayer);
            this.stage.addChild(this.lightWaveLayer);
            this.stage.addChild(this.middleLayer);
            this.stage.addChild(this.topLayer);

            this.initMVT();
            this.initLightRays();
            this.initLaserView();
        },

        initMVT: function() {
            var modelHeight = this.simulation.getHeight();
            var scale = this.height / modelHeight;
            
            this.viewOriginX = Math.round(this.width / 2 - this.centerOffsetLeft);
            this.viewOriginY = Math.round(this.height / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initLightRays: function() {
            this.laserBeamView = new LaserBeamView({
                simulation: this.simulation,
                mvt: this.mvt,
                stageWidth: this.width,
                stageHeight: this.height
            });
            this.lightWaveLayer.addChild(this.laserBeamView.displayObject);
        },

        initLaserView: function() {
            this.laserView = new LaserView({
                model: this.simulation.laser,
                mvt: this.mvt
            });

            this.topLayer.addChild(this.laserView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            if (this.simulation.dirty) {
                this.laserBeamView.draw();
            }
        },

    }, Constants.SceneView);

    return BendingLightSceneView;
});
