define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/v3/pixi/extensions');
    require('common/v3/pixi/dash-to');

    var AppView   = require('common/app/app');
    var PixiSceneView = require('common/v3/pixi/view/scene');
    var RayGunView = require('rutherford-scattering/views/gun');
    var SpaceBoxView = require('rutherford-scattering/views/space-box');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!rutherford-scattering/styles/scene');

    /**
     *
     */
    var RutherfordScatteringSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initBoxMVT: function(){
            if (AppView.windowIsShort()) {
                this.viewOriginX = Math.round(this.width / 2);
                this.viewOriginY = Math.round((this.height - 50)/ 2);
                this.spaceBoxSize = Constants.BOX_SIZE_SMALL;
            }
            else {
                this.viewOriginX = Math.round((this.width - 100) / 2);
                this.viewOriginY = Math.round((this.height - 96) / 2);
                this.spaceBoxSize = Constants.BOX_SIZE;
            }

            this.scale = this.spaceBoxSize/this.simulation.boundWidth;
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                this.scale
            );
        },

        initParticleMVT: function() {
            this.particleMVT = ModelViewTransform.createScaleMapping(Constants.PARTICLE_SCALE);
        },

        initRayGunMVT: function() {
            if (AppView.windowIsShort()) {
                this.rayGunOriginX = 100;
                this.rayGunOriginY = Math.round((this.height + 200) / 2);
            }
            else {
                this.rayGunOriginX = 60;
                this.rayGunOriginY = Math.round(this.height / 2);
            }

            var pixelsPerCentimeter = 5;

            this.rayGunMVT = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.rayGunOriginX, this.rayGunOriginY),
                pixelsPerCentimeter
            );
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.bottomLayer   = new PIXI.Container();
            this.topLayer   = new PIXI.Container();

            this.stage.addChild(this.bottomLayer);
            this.stage.addChild(this.topLayer);

            this.initBoxMVT();
            this.initParticleMVT();
            this.initRayGunMVT();

            this.initRayGunView();
            this.initSpaceBoxView();
            this.initAtomView();
            this.drawProjectionLines();
        },

        initRayGunView: function() {
            this.simulation.rayGun.set('scale', this.scale);
            this.rayGunView = new RayGunView({
                mvt: this.rayGunMVT,
                model: this.simulation.rayGun
            });

            this.topLayer.addChild(this.rayGunView.displayObject);
        },

        initSpaceBoxView: function() {
            this.spaceBoxView = new SpaceBoxView({
                mvt: this.mvt,
                particleMVT: this.particleMVT,
                scale: this.scale,
                spaceBoxSize: this.spaceBoxSize,
                simulation: this.simulation
            });

            this.topLayer.addChild(this.spaceBoxView.displayObject);
        },

        initAtomView: function() {

        },

        drawProjectionLines: function() {
            var rayViewTop    = this.rayGunView.getRayViewTop();
            var rayViewBottom = this.rayGunView.getRayViewBottom();
            var rayViewLeft   = this.rayGunView.getRayViewLeft();

            var spaceBoxTop    = this.spaceBoxView.getTop();
            var spaceBoxBottom = this.spaceBoxView.getBottom();
            var spaceBoxLeft   = this.spaceBoxView.getLeft();

            var projectionLines = new PIXI.Graphics();
            var dashStyle = [3, 3];

            projectionLines.lineStyle(0.75, 0xFFFFFF, 1);
            projectionLines.moveTo(rayViewLeft, rayViewTop);
            projectionLines.dashTo(spaceBoxLeft, spaceBoxTop, dashStyle);

            projectionLines.moveTo(rayViewLeft, rayViewBottom);
            projectionLines.dashTo(spaceBoxLeft, spaceBoxBottom, dashStyle);

            this.topLayer.addChild(projectionLines);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.spaceBoxView._update(time, deltaTime, paused, timeScale);
        },

        reset: function() {
            this.spaceBoxView.reset();
        }

    });

    return RutherfordScatteringSceneView;
});
