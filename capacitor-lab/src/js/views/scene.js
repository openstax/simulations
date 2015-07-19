define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');

    var PixiSceneView        = require('common/pixi/view/scene');
    var AppView              = require('common/app/app');
    var ModelViewTransform3D = require('common/math/model-view-transform-3d');
    var Vector2              = require('common/math/vector2');
    var Rectangle            = require('common/math/rectangle');

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
            var bounds = new Rectangle(0, 0, 0.06, 0.055);

            // // ...to the usable screen space that we have
            var controlsWidth = 220;
            var margin = 20;
            var leftMargin = AppView.windowIsShort() ? margin + controlsWidth + margin : margin;
            var rightMargin = margin + controlsWidth + margin;
            var usableScreenSpace = new Rectangle(leftMargin, 0, this.width - leftMargin - rightMargin, this.height);

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x);
            this.viewOriginY = Math.round(usableScreenSpace.y);

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
