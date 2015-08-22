define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var BendingLightSceneView = require('views/scene');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var IntroSceneView = BendingLightSceneView.extend({

        initialize: function(options) {
            BendingLightSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            BendingLightSceneView.prototype.initGraphics.apply(this, arguments);

            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xCCCCFF, 1);
            graphics.drawRect(0, this.height / 2, this.width, this.height / 2);
            graphics.endFill();

            this.stage.addChild(graphics);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return IntroSceneView;
});
