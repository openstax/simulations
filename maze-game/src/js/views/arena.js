define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Level = require('models/level');

    var ParticleView = require('views/particle');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * Draws the level and the player particle
     */
    var ArenaView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;
            this.sceneWidth = options.sceneWidth;
            this.sceneHeight = options.sceneHeight;

            this.initGraphics();

            this.listenTo(this.model, 'change:level', this.drawLevel);
        },

        initGraphics: function() {
            // Create layers
            this.floor   = new PIXI.DisplayObjectContainer();
            this.shadows = new PIXI.DisplayObjectContainer();
            this.walls   = new PIXI.DisplayObjectContainer();

            // Add layers
            this.displayObject.addChild(this.floor);
            this.displayObject.addChild(this.shadows);
            this.displayObject.addChild(this.walls);

            this.initParticleView();

            this.updateMVT(this.mvt);
        },

        initParticleView: function() {
            this.particleView = new ParticleView({
                model: this.model.particle,
                mvt: this.mvt
            });

            this.displayObject.addChild(this.particleView.displayObject);
        },

        drawLevel: function() {
            // Clear the layer caches
            this.floor.cacheAsBitmap   = false;
            this.shadows.cacheAsBitmap = false;
            this.walls.cacheAsBitmap   = false;

            this.drawFloor();
            this.drawWalls();

            // Cache each layer because they don't change
            this.floor.cacheAsBitmap   = true;
            this.shadows.cacheAsBitmap = true;
            this.walls.cacheAsBitmap   = true;
        },

        drawFloor: function() {
            this.floor.removeChildren();

            // Draw tiles out to the edges of the scene as a base layer
            var xStartTile = Math.floor(this.mvt.viewToModelX(0) / Constants.TILE_SIZE);
            var yStartTile = Math.floor(this.mvt.viewToModelY(0) / Constants.TILE_SIZE);
            var xEndTile = Math.ceil(this.mvt.viewToModelX(this.sceneWidth)  / Constants.TILE_SIZE);
            var yEndTile = Math.ceil(this.mvt.viewToModelY(this.sceneHeight) / Constants.TILE_SIZE);

            var tileSprite;
            for (var x = xStartTile; x < xEndTile; x++) {
                for (var y = yStartTile; y < yEndTile; y++) {
                    tileSprite = Assets.createSprite(Assets.Images.FLOOR);
                    tileSprite.x = this.mvt.modelToViewX(x * Constants.TILE_SIZE);
                    tileSprite.y = this.mvt.modelToViewY(y * Constants.TILE_SIZE);
                    tileSprite.scale.x = this.tileScale;
                    tileSprite.scale.y = this.tileScale;
                    this.floor.addChild(tileSprite);
                }
            }

            // Create the FINISH tile
            var level = this.model.get('level');
            var finish = level.finishPosition();
            tileSprite = Assets.createSprite(Assets.Images.FINISH);
            tileSprite.x = this.mvt.modelToViewX(level.colToX(finish.col));
            tileSprite.y = this.mvt.modelToViewY(level.rowToY(finish.row));
            tileSprite.scale.x = this.tileScale;
            tileSprite.scale.y = this.tileScale;
            this.floor.addChild(tileSprite);
        },

        drawWalls: function() {
            this.shadows.removeChildren();
            this.walls.removeChildren();

            var level = this.model.get('level');
            var data = level.data;

            var x, y;
            var wallSprite;
            var shadowSprite;

            for (var r = 0; r < data.length; r++) {
                for (var c = 0; c < data[r].length; c++) {
                    if (data[r][c] === Level.TILE_WALL) {
                        x = this.mvt.modelToViewX(level.colToX(c));
                        y = this.mvt.modelToViewY(level.rowToY(r));

                        // Create wall
                        wallSprite = Assets.createSprite(Assets.Images.WALL);
                        wallSprite.x = x;
                        wallSprite.y = y;
                        wallSprite.scale.x = this.tileScale;
                        wallSprite.scale.y = this.tileScale;
                        this.walls.addChild(wallSprite);

                        // Create wall shadow
                        shadowSprite = Assets.createSprite(Assets.Images.WALL_SHADOW);
                        shadowSprite.x = x;
                        shadowSprite.y = y;
                        shadowSprite.anchor.x = 0.25;
                        shadowSprite.anchor.y = 0.25;
                        shadowSprite.scale.x = this.tileScale;
                        shadowSprite.scale.y = this.tileScale;
                        this.shadows.addChild(shadowSprite);
                    }
                }
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.tileSize = this.mvt.modelToViewDeltaX(Constants.TILE_SIZE);
            this.tileScale = this.tileSize / Assets.Texture(Assets.Images.FLOOR).width;

            this.drawLevel();
        },

        update: function(time, deltaTime, paused) {
            this.particleView.update(time, deltaTime, paused);
        }

    });

    return ArenaView;
});