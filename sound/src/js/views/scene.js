define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var WaveMediumView = require('views/wave-medium');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var SoundSceneView = PixiSceneView.extend({

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
            this.initWaveMediumView();
        },

        initMVT: function() {
            var minimumHeight = 12; // Meters
            var usableHeight = this.height;
            var scale = usableHeight / minimumHeight;
            
            this.viewOriginX = 120;
            this.viewOriginY = Math.round(usableHeight / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initWaveMediumView: function() {
            this.waveMediumView = new WaveMediumView({
                model: this.simulation.waveMedium,
                mvt: this.mvt
            });
            this.stage.addChild(this.waveMediumView.displayObject);

            this.waveMediumView.displayObject.x = this.mvt.modelToViewX(0);
            this.waveMediumView.displayObject.y = this.mvt.modelToViewY(0);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.waveMediumView.update(time, deltaTime, paused);
        },

    });

    return SoundSceneView;
});
