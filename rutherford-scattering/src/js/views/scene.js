define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView   = require('common/app/app');
    var PixiSceneView = require('common/v3/pixi/view/scene');
    var RayGunView = require('rutherford-scattering/views/gun');
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
                this.viewOriginY = Math.round(this.height / 2);
            }
            else {
                this.viewOriginX = Math.round((this.width - 200)  / 2);
                this.viewOriginY = Math.round(this.height / 2);
            }

            this.initRayGunMVT();
        },

        initRayGunMVT: function() {
            if (AppView.windowIsShort()) {
                this.rayGunOriginX = Math.round((this.width - 200 - Constants.BOX_SIZE) / 2);
                this.rayGunOriginY = Math.round((this.height + 152) / 2);
            }
            else {
                this.rayGunOriginX = Math.round((this.width - 200 - Constants.BOX_SIZE)  / 2);
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
            this.initRayGunView();
        },

        initRayGunView: function() {
            this.rayGunView = new RayGunView({
                mvt: this.rayGunMVT,
                model: this.simulation.rayGun
            });

            this.bottomLayer.addChild(this.rayGunView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return RutherfordScatteringSceneView;
});
