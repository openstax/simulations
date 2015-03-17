define(function(require) {

    'use strict';

    // Third-party dependencies
    var _    = require('underscore');
    var PIXI = require('pixi');

    // Common dependencies
    var Vector2            = require('common/math/vector2');
    var ModelViewTransform = require('common/math/model-view-transform');
    var PixiSceneView      = require('common/pixi/view/scene');

    // Project dependencies

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var PendulumLabSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.zoomScale = 1;
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

            this.initLayers();
        },

        initLayers: function() {
            this.toolsLayer  = new PIXI.DisplayObjectContainer();
            this.bodyLayer   = new PIXI.DisplayObjectContainer();
            this.springLayer = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.toolsLayer);
            this.stage.addChild(this.bodyLayer);
            this.stage.addChild(this.springLayer);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        setVolume: function(volume) {

        }

    });

    return PendulumLabSceneView;
});
