define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');

    var PixiSceneView        = require('common/pixi/view/scene');
    var ModelViewTransform3D = require('common/math/model-view-transform-3d');
    var Vector2              = require('common/math/vector2');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var CapacitorLabSceneView = PixiSceneView.extend({

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
        },

        initMVT: function() {
            // Map the simulation bounds...
            // var bounds = this.simulation.bounds;

            // // ...to the usable screen space that we have
            // var controlsWidth = 180;
            // var margin = 20;
            // var leftMargin = AppView.windowIsShort() ? margin + controlsWidth + margin : margin;
            // var rightMargin = margin + controlsWidth + margin;
            // var usableScreenSpace = new Rectangle(leftMargin, 0, this.width - leftMargin - rightMargin, this.height);

            // var boundsRatio = bounds.w / bounds.h;
            // var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            // var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            // this.viewOriginX = Math.round(usableScreenSpace.x + usableScreenSpace.w / 2);
            // this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h);

            this.viewOriginX = 15;
            this.viewOriginY = 15;
            var scale = 15000;

            this.mvt = ModelViewTransform3D.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale,
                scale,
                Constants.MVT_PITCH,
                Constants.MVT_YAW
            );
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return CapacitorLabSceneView;
});
