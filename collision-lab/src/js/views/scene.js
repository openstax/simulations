define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var CollisionLabSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            options = _.extend({
                oneDimensional: false
            }, options);

            this.oneDimensional = options.oneDimensional;

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

    return CollisionLabSceneView;
});
