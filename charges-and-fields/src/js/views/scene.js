define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var GridView           = require('common/pixi/view/grid');
    var AppView            = require('common/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');
    var SceneView = Constants.SceneView;

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var ChargesAndFieldsSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initGrid();
        },

        initMVT: function() {
            var heightInMeters = Constants.SIM_HEIGHT_IN_METERS;
            var scale = (this.height - 2) / heightInMeters;
            var widthInMeters = Math.ceil(this.width / scale);
            
            this.viewOriginX = -(widthInMeters / 2) * scale;
            this.viewOriginY = 0;

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initGrid: function() {
            this.gridView = new GridView({
                origin: new Vector2(this.viewOriginX, this.viewOriginY),
                bounds: new Rectangle(0, 0, this.width, this.height),

                gridSize:         this.mvt.modelToViewDeltaX(SceneView.GRID_MAJOR_SIZE_IN_METERS),
                smallGridSize:    this.mvt.modelToViewDeltaX(SceneView.GRID_MINOR_SIZE_IN_METERS),
                smallGridEnabled: true,

                lineWidth: 2,
                lineColor: SceneView.GRID_COLOR,
                lineAlpha: SceneView.GRID_ALPHA,

                smallLineColor: SceneView.GRID_COLOR,
                smallLineWidth: 1,
                smallLineAlpha: SceneView.GRID_ALPHA
            });
            //this.gridView.hide();
            this.stage.addChild(this.gridView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return ChargesAndFieldsSceneView;
});
