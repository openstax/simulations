define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

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

            this.initMVT();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var simWidth  = Constants.SCENE_WIDTH;
            var simHeight = Constants.SCENE_HEIGHT;

            // ...to the usable screen space that we have
            var controlsWidth = 220;
            var margin = 20;
            var rightMargin = 0 + controlsWidth + margin;
            var usableWidth = this.width - rightMargin;
            var usableHeight = this.height - 62;

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
        }

    });

    return FaradaySceneView;
});
