define(function(require) {

    'use strict';

    // Third-party dependencies
    var _    = require('underscore');
    var PIXI = require('pixi');

    // Common dependencies
    var PixiSceneView = require('common/pixi/view/scene');

    // Project dependencies
    var ArenaView = require('views/arena');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var MazeGameSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initArenaView();
        },

        initArenaView: function() {
            this.arenaView = new ArenaView({
                model: this.simulation
            });

            this.stage.addChild(this.arenaView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return MazeGameSceneView;
});
