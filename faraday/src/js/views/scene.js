define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var BFieldOutsideView = require('views/bfield/outside');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var FaradaySceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.bottomLayer = new PIXI.Container();
            this.middleLayer = new PIXI.Container();
            this.topLayer = new PIXI.Container();

            this.stage.addChild(this.bottomLayer);
            this.stage.addChild(this.middleLayer);
            this.stage.addChild(this.topLayer);

            this.initMVT();
            this.initOutsideBField();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var simWidth  = Constants.SCENE_WIDTH;
            var simHeight = Constants.SCENE_HEIGHT;

            // ...to the usable screen space that we have
            var controlsWidth = 220;
            var margin = 20;
            var rightMargin = 0; //0 + controlsWidth + margin;
            var usableWidth = this.width - rightMargin;
            var usableHeight = this.height; // - 62;

            var simRatio = simWidth / simHeight;
            var screenRatio = usableWidth / usableHeight;
            
            var scale = (screenRatio > simRatio) ? usableHeight / simHeight : usableWidth / simWidth;
            
            this.viewOriginX = (usableWidth - simWidth * scale) / 2; // Center it
            this.viewOriginY = 0;

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initOutsideBField: function() {
            this.bFieldOutsideView = new BFieldOutsideView({
                mvt: this.mvt,
                magnetModel: this.simulation.barMagnet,
                xSpacing:    Constants.GRID_SPACING, 
                ySpacing:    Constants.GRID_SPACING,
                needleWidth: Constants.GRID_NEEDLE_WIDTH,
                bounds: new Rectangle(0, 0, this.width, this.height)
            });

            this.bottomLayer.addChild(this.bFieldOutsideView.displayObject);
        },

        setNeedleSpacing: function(spacing) {
            this.bFieldOutsideView.setNeedleSpacing(spacing);
        },

        setNeedleSize: function(width, height) {
            this.bFieldOutsideView.setNeedleWidth(width);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            if (this.simulation.updated()) {
                this.bFieldOutsideView.update();
            }
        },

    });

    return FaradaySceneView;
});
