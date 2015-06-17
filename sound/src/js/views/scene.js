define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');

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

            this.waveMediumView = new WaveMediumView({
                model: this.simulation.waveMedium
            });
            this.stage.addChild(this.waveMediumView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.waveMediumView.update(time, deltaTime, paused);
        },

    });

    return SoundSceneView;
});
