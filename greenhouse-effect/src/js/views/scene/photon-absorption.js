define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var PixiToImage        = require('common/pixi/pixi-to-image');
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
    var PhotonAbsorptionSceneView = PixiSceneView.extend({

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xFF0000, 1);
            graphics.drawCircle(0, 0, 20);
            graphics.endFill();

            var data = PixiToImage.displayObjectToDataURI(graphics);

            this.initMVT();

        },

        initMVT: function() {
            // Map the simulation bounds...
            // var bounds = this.simulation.bounds;

            // // ...to the usable screen space that we have
            // var controlsWidth = 210;
            // var usableScreenSpace = new Rectangle(0, 0, this.width - controlsWidth, this.height);

            // if ($(window).height() <= 500) {
            //     usableScreenSpace.x += controlsWidth;
            //     usableScreenSpace.w -= controlsWidth;
            // }

            // var boundsRatio = bounds.w / bounds.h;
            // var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            // var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            // this.viewOriginX = Math.round(usableScreenSpace.x + usableScreenSpace.w / 2);
            // this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h);

            // this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
            //     new Vector2(0, 0),
            //     new Vector2(this.viewOriginX, this.viewOriginY),
            //     scale
            // );
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        }

    });

    return PhotonAbsorptionSceneView;
});
