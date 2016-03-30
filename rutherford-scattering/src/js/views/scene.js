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

        initMVT: function(){
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

            this.particleMVT = ModelViewTransform.createScaleMapping(4);
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
            this.middleLayer   = new PIXI.Container();
            this.electronLayer = new PIXI.Container();
            this.topLayer      = new PIXI.Container();

            this.stage.addChild(this.bottomLayer);
            this.stage.addChild(this.middleLayer);
            this.stage.addChild(this.electronLayer);
            this.stage.addChild(this.topLayer);

            this.initMVT();
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

            this.middleLayer.addChild(this.rayGunView.displayObject);
        },

        initSpaceBoxView: function() {
            this.spaceBoxView = new SpaceBoxView({
                mvt: this.mvt,
                particleMVT: this.particleMVT,
                scale: this.scale,
                spaceBoxSize: this.spaceBoxSize,
                simulation: this.simulation
            });

            this.middleLayer.addChild(this.spaceBoxView.displayObject);
        },

        initAtomView: function() {

        },

        drawProjectionLines: function() {
            var rayViewCorners = this.getLeftCorners(this.rayGunView.rayView);
            var spaceBoxCorners = this.getLeftCorners(this.spaceBoxView.box);

            var projectionLines = new PIXI.Graphics();
            var dashStyle = [6, 6];

            projectionLines.lineStyle(0.75, 0xFFFFFF, 1);
            projectionLines.moveTo(rayViewCorners.top.x, rayViewCorners.top.y);
            projectionLines.dashTo(spaceBoxCorners.top.x, spaceBoxCorners.top.y, dashStyle);

            projectionLines.moveTo(rayViewCorners.bottom.x, rayViewCorners.bottom.y);
            projectionLines.dashTo(spaceBoxCorners.bottom.x, spaceBoxCorners.bottom.y, dashStyle);

            this.middleLayer.addChild(projectionLines);
        },

        getLeftCorners: function(box) {
            var offset = box.toGlobal(box.graphicsData[0].shape);
            var rectangle = box.graphicsData[0].shape;

            var top = {
                x: offset.x + box.parent.position.x + box.parent.parent.position.x,
                y: offset.y + box.parent.position.y + box.parent.parent.position.y
            };

            var bottom = {
                x: offset.x + box.parent.position.x + box.parent.parent.position.x,
                y: offset.y + box.parent.position.y + box.parent.parent.position.y + rectangle.height
            };

            return {top: top, bottom: bottom};
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.spaceBoxView._update(time, deltaTime, paused, timeScale);
        }

    });

    return RutherfordScatteringSceneView;
});
