define(function(require) {

    'use strict';

    // Third-party dependencies

    // Common dependencies
    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    // Project dependencies
    var Level = require('models/level');
    var ArenaView           = require('views/arena');
    var ParticleControlView = require('views/particle-control');

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

            this.listenTo(this.simulation, 'change:level', this.levelChanged);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initArenaView();
            this.initParticleControlView();
        },

        initMVT: function() {
            var levelWidth  = Level.WIDTH  * Constants.TILE_SIZE;
            var levelHeight = Level.HEIGHT * Constants.TILE_SIZE;

            var sceneHeight = $(window).height() > 500 ? this.height : this.height - 190;

            var sceneRatio = this.width / sceneHeight;
            var levelRatio = levelWidth / levelHeight;
            
            var scale = (sceneRatio > levelRatio) ? sceneHeight / levelHeight : this.width / levelWidth;

            this.viewOriginX = Math.round(this.width / 2);            // Center
            this.viewOriginY = Math.round((levelHeight * scale) / 2); // Top

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initArenaView: function() {
            this.arenaView = new ArenaView({
                model: this.simulation,
                mvt: this.mvt,
                sceneWidth: this.width,
                sceneHeight: this.height
            });

            this.stage.addChild(this.arenaView.displayObject);
        },

        initParticleControlView: function() {
            var controlAreaHeight = this.calculateControlAreaHeight();
            var controlAreaWidth  = Math.round((Level.WIDTH / Level.HEIGHT) * controlAreaHeight);

            this.particleControlView = new ParticleControlView({
                model: this.simulation.particle,
                areaWidth: controlAreaWidth,
                areaHeight: controlAreaHeight
            });

            var margin = $(window).height() > 500 ? 15 : 0;

            this.particleControlView.displayObject.x = this.width  - margin;
            this.particleControlView.displayObject.y = this.height - margin;

            this.stage.addChild(this.particleControlView.displayObject);
        },

        calculateControlAreaHeight: function() {
            var tileSize = this.mvt.modelToViewDeltaX(Constants.TILE_SIZE);
            var availableHeight = this.height - (tileSize * Level.HEIGHT);
            if ($(window).height() > 500)
                availableHeight -= 50;
            else
                availableHeight -= 30;
            return availableHeight;
        },

        reset: function() {
            this.particleControlView.reset();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.arenaView.update(time, deltaTime, paused);
        },

        levelChanged: function(simulation, level) {
            this.particleControlView.reset();
        }

    });

    return MazeGameSceneView;
});
