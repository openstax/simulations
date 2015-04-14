define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');
    var Vector2            = require('common/math/vector2');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var CollisionLabSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            options = _.extend({
                oneDimensional: false
            }, options);

            this.oneDimensional = options.oneDimensional;

            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initBorderGraphic();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = this.simulation.bounds;

            // ...to the usable screen space that we have
            var usableScreenSpace = new Rectangle(
                20,       // Left margin
                20 + 185, // Top margin plus ball settings matrix
                this.width - 20 - 20 - 190 - 20,
                this.height - 20 - 185 - 65 - 20
            );

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x);
            this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initBorderGraphic: function() {
            this.border = new PIXI.Graphics();
            this.border.lineStyle(3, 0xFFFFFF, 1);
            this.stage.addChild(this.border);

            this.drawBorder();
        },

        drawBorder: function() {
            this.border.drawRect(
                this.mvt.modelToViewX(this.simulation.bounds.x),
                this.mvt.modelToViewY(this.simulation.bounds.y),
                this.mvt.modelToViewDeltaX(this.simulation.bounds.w),
                this.mvt.modelToViewDeltaY(this.simulation.bounds.h)
            );
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return CollisionLabSceneView;
});
