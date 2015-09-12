define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var IntensityMeter = require('models/intensity-meter');

    var LaserView          = require('views/laser');
    var LaserBeamsView     = require('views/laser-beams');
    var IntensityMeterView = require('views/intensity-meter');
    var ProtractorView     = require('views/protractor');

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

            this.mediumLayer    = new PIXI.Container();
            this.bottomLayer    = new PIXI.Container();
            this.lightRayLayer  = new PIXI.Container();
            this.lightWaveLayer = new PIXI.Container();
            this.middleLayer    = new PIXI.Container();
            this.topLayer       = new PIXI.Container();

            this.stage.addChild(this.mediumLayer);
            this.stage.addChild(this.bottomLayer);
            this.stage.addChild(this.lightRayLayer);
            this.stage.addChild(this.lightWaveLayer);
            this.stage.addChild(this.middleLayer);
            this.stage.addChild(this.topLayer);

            this.initMVT();
            this.initLightRays();
            this.initLaserView();
            this.initProtractorView();
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
            this.laserBeamsView = new LaserBeamsView({
                simulation: this.simulation,
                mvt: this.mvt,
                stageWidth: this.width,
                stageHeight: this.height
            });
            this.lightWaveLayer.addChild(this.laserBeamsView.displayObject);
        },

        initLaserView: function() {
            this.laserView = new LaserView({
                model: this.simulation.laser,
                mvt: this.mvt
            });

            this.topLayer.addChild(this.laserView.displayObject);
        },

        initProtractorView: function() {
            this.protractorView = new ProtractorView({
                mvt: this.mvt
            });
            this.protractorView.displayObject.x = this.width / 2;
            this.protractorView.displayObject.y = this.height / 2;
            this.protractorView.hide();

            this.middleLayer.addChild(this.protractorView.displayObject);
        },

        reset: function() {
            this.protractorView.displayObject.x = this.width / 2;
            this.protractorView.displayObject.y = this.height / 2;
        },

        _update: function(time, deltaTime, paused, timeScale) {
            if (this.simulation.dirty || this.simulation.laser.get('wave')) {
                this.laserBeamsView.update();
            }
        },

        getNormalLineIcon: function() {
            var normalLine = new PIXI.Graphics();

            normalLine.lineStyle(1, 0x000000, 1);
            normalLine.moveTo(0, -15);
            normalLine.dashTo(0,  15, [ 6, 6 ]);

            // Draw some transparent space to give it a margin on the left
            normalLine.lineStyle(1, 0x000000, 0);
            normalLine.moveTo(-8, 15);

            return PixiToImage.displayObjectToDataURI(normalLine);
        },

        getIntensityMeterIcon: function() {
            var mvt = new ModelViewTransform.createSinglePointScaleMapping(new Vector2(0, 0), new Vector2(0, 0), 1);

            var intensityMeter = new IntensityMeter({
                sensorPosition: new Vector2(-25, 0),
                bodyPosition:   new Vector2(25, 0)
            });

            var intensityMeterView = new IntensityMeterView({
                model: intensityMeter,
                mvt: mvt
            });

            return PixiToImage.displayObjectToDataURI(intensityMeterView.displayObject);
        },

        showProtractor: function() {
            this.protractorView.show();
        },

        hideProtractor: function() {
            this.protractorView.hide();
        }

    }, Constants.SceneView);

    return BendingLightSceneView;
});
