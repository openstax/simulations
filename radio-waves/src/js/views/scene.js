define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');
    var AppView       = require('common/app/app');

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
        },

        initBackground: function() {
            var bg = Assets.createSprite(Assets.Images.BACKGROUND);
            bg.anchor.y = 1;
            bg.anchor.x = 0.5;
            bg.y = this.height;
            bg.x = this.width / 2;
            this.stage.addChild(bg);

            this.bg = bg;
            this.updateBackgroundScale();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        updateBackgroundScale: function() {
            var targetBackgroundWidth = AppView.windowIsShort() ? this.width : this.bg.width; // In pixels
            var scale = targetBackgroundWidth / this.bg.width;
            this.bg.scale.x = scale;
            this.bg.scale.y = scale;
        },

    });

    return RadioWavesSceneView;
});
