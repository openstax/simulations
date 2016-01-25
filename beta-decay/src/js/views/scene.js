define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/v3/pixi/view/scene');

    var Assets = require('assets');

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

            var nuclearPhysicsSprite = Assets.createSprite(Assets.Images.SPHERE);
            var betaDecaySprite = Assets.createSprite(Assets.Images.MUSHROOM_CLOUD);

            this.stage.addChild(betaDecaySprite);
            this.stage.addChild(nuclearPhysicsSprite);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        }

    });

    return BetaDecaySceneView;
});
