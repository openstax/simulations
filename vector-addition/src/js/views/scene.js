define(function(require) {

    'use strict';

    //var $        = require('jquery');
    var _         = require('underscore');
    var PIXI      = require('pixi');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var ModelViewTransform   = require('common/math/model-view-transform');
    var PixiSceneView        = require('common/pixi/view/scene');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var VectorAdditionSceneView = PixiSceneView.extend({

        events: {

        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.views = [];
        },

        /**
         * Renders
         */
        renderContent: function() {

        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.viewOriginX = Math.round(this.width * 0.25); // not centered
            this.viewOriginY = Math.round(this.height * .75);
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                10 // Scale
            );

            this.initLayers();
            this.initElements();
        },

        initLayers: function() {
            // Create layers
            this.backLayer = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.backLayer);
        },

        initElements: function() {

        },

        _update: function(time, deltaTime, paused, timeScale) {
            for (var i = 0; i < this.views.length; i++)
                this.views[i].update(time, deltaTime, paused, timeScale);
        },

        reset: function() {

        }

    });

    return VectorAdditionSceneView;
});
