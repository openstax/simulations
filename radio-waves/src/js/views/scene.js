define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var AppView            = require('common/app/app');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');
    var ModelViewTransform = require('common/math/model-view-transform');

    var ElectronPositionPlot = require('views/electron-position-plot');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var RadioWavesSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initBackground();
            this.initMVT();
            this.initElectronPositionPlots();

            this.updateBackgroundScale();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = Constants.SIMULATION_BOUNDS;

            // ...to the usable screen space that we have
            var availableWidth = AppView.windowIsShort() ? this.width * this.getBackgroundScale() : this.width;
            var availableHeight = this.height + 999; // Just a value that is big enough not to matter
            var x = AppView.windowIsShort() ? (this.width - availableWidth) / 2 : 0;
            var usableScreenSpace = new Rectangle(x, 0, availableWidth, availableHeight);

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x);
            this.viewOriginY = Math.round(this.height - bounds.h * scale);

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initBackground: function() {
            var bg = Assets.createSprite(Assets.Images.BACKGROUND);
            bg.anchor.y = 1;
            bg.anchor.x = 0.5;
            bg.y = this.height;
            bg.x = this.width / 2;
            this.stage.addChild(bg);

            this.bg = bg;
        },

        initElectronPositionPlots: function() {
            this.transmittingElectronPositionPlot = new ElectronPositionPlot({
                mvt: this.mvt,
                simulation: this.simulation,
                electron: this.simulation.transmittingElectron,
                title: 'Transmitter'
            });

            this.stage.addChild(this.transmittingElectronPositionPlot.displayObject);
        },

        resize: function() {
            PixiSceneView.prototype.resize.apply(this, arguments);

            if (this.bg) {
                this.updateBackgroundScale();
                this.bg.y = this.height;
            }
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        updateBackgroundScale: function() {
            var scale = this.getBackgroundScale();
            this.bg.scale.x = scale;
            this.bg.scale.y = scale;
        },

        getBackgroundScale: function() {
            var targetBackgroundWidth = AppView.windowIsShort() ? this.width : this.bg.texture.width; // In pixels
            var scale = targetBackgroundWidth / this.bg.texture.width;
            return scale;
        }

    });

    return RadioWavesSceneView;
});
