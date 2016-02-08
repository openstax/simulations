define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/v3/pixi/view/scene');

    var Assets = require('assets');

    // CSS
    require('less!beta-decay/styles/scene');

    /**
     *
     */
    var BetaDecaySceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            var sphere = Assets.createSprite(Assets.Images.SPHERE);
            sphere.tint = 0xFF0000;
            sphere.scale.x = sphere.scale.y = 0.25;

            this.stage.addChild(sphere);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        }

    });

    return BetaDecaySceneView;
});
