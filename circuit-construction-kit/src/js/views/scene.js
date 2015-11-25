define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var GrabBagButton    = require('views/grab-bag-button');
    var ComponentToolbox = require('views/component-toolbox');

    var Assets    = require('assets');
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var CCKSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        postRender: function() {
            PixiSceneView.prototype.postRender.apply(this, arguments);
        },

        reset: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.dummyLayer = new PIXI.Container();

            if (AppView.windowIsShort()) {
                this.viewOriginX = Math.round((this.width - 230) / 2);
                this.viewOriginY = Math.round((this.height - 62) / 2);
                this.zoomScale = 1;
            }
            else {
                this.viewOriginX = Math.round(this.width  / 2);
                this.viewOriginY = Math.round(this.height / 2);    
            }

            this.initMVT();
            this.initComponentToolbox();
            this.initGrabBagButton();

            this.stage.addChild(this.dummyLayer);
        },

        initComponentToolbox: function() {
            this.componentToolbox = new ComponentToolbox({
                mvt: this.mvt,
                simulation: this.simulation,
                dummyLayer: this.dummyLayer,
                icons: []
            });
            this.componentToolbox.displayObject.x = 20;
            this.componentToolbox.displayObject.y = 20;
            this.stage.addChild(this.componentToolbox.displayObject);
        },

        initGrabBagButton: function() {
            this.grabBagButton = new GrabBagButton({
                mvt: this.mvt,
                simulation: this.simulation,
                dummyLayer: this.dummyLayer,
                icons: []
            });
            this.grabBagButton.displayObject.x = 20;
            this.grabBagButton.displayObject.y = this.height - 62 - 20;
            this.stage.addChild(this.grabBagButton.displayObject);
        },

        initMVT: function() {
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                this.zoomScale
            );
        },

        updateMVTs: function() {
            var mvt = this.mvt;

        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        zoomIn: function() {
            var zoom = this.zoomScale + 0.4;
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
            var zoom = this.zoomScale - 0.4;
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

    });

    return CCKSceneView;
});
