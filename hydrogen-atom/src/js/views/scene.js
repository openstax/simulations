define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/v3/pixi/view/scene');

    var Assets = require('hydrogen-atom/assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!hydrogen-atom/styles/scene');

    /**
     *
     */
    var HydrogenAtomSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return HydrogenAtomSceneView;
});
