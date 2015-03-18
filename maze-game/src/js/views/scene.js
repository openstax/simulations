define(function(require) {

    'use strict';

    // Third-party dependencies
    var _    = require('underscore');
    var PIXI = require('pixi');

    // Common dependencies
    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    // Project dependencies
    var Level = require('models/level');
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

            this.initMVT();
            this.initArenaView();
        },

        initMVT: function() {
            var levelWidth  = Level.LEVEL_WIDTH  * Constants.TILE_SIZE;
            var levelHeight = Level.LEVEL_HEIGHT * Constants.TILE_SIZE;

            var sceneRatio = this.width / this.height;
            var levelRatio = levelWidth / levelHeight;
            
            var scale = (sceneRatio > levelRatio) ? this.height / levelHeight : this.width / levelWidth;

            this.viewOriginX = Math.round(this.width  / 2);
            this.viewOriginY = Math.round(this.height / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initArenaView: function() {
            this.arenaView = new ArenaView({
                model: this.simulation,
                mvt: this.mvt
            });

            this.stage.addChild(this.arenaView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return MazeGameSceneView;
});
