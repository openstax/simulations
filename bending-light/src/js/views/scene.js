define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var LaserView = require('views/laser');

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
            this.rayGraphics = new PIXI.Graphics();
            this.lightWaveLayer.addChild(this.rayGraphics);
        },

        initLaserView: function() {
            this.laserView = new LaserView({
                model: this.simulation.laser,
                mvt: this.mvt
            });

            this.topLayer.addChild(this.laserView.displayObject);
        },

        drawLightRays: function() {
            var rays = this.simulation.rays;

            // Sort rays by zIndex so the lower z-indexes come first
            rays.sort(function(a, b) {
                return a.zIndex - b.zIndex;
            });

            var graphics = this.rayGraphics;
            graphics.clear();

            var beamWidth = BendingLightSceneView.LASER_BEAM_WIDTH;

            // For each LightRay instance:
                // Set our line color to its color
                // Draw a line between its endpoints
            var point;
            for (var i = 0; i < rays.length; i++) {
                graphics.lineStyle(beamWidth, Constants.wavelengthToHex(rays[i].getLaserWavelength(), true), rays[i].getPowerFraction());
                point = this.mvt.modelToView(rays[i].getTip());
                graphics.moveTo(point.x, point.y);
                point = this.mvt.modelToView(rays[i].getTail());
                graphics.lineTo(point.x, point.y);
            }
        },

        _update: function(time, deltaTime, paused, timeScale) {
            if (this.simulation.dirty) {
                this.drawLightRays();
            }
        },

    }, Constants.SceneView);

    return BendingLightSceneView;
});
