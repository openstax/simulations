define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');

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
            this.listenTo(this.model, 'change:collisions', this.collisionsChanged);
        },

        initGraphics: function() {
            // Create layers
            this.floor   = new PIXI.DisplayObjectContainer();
            this.shadows = new PIXI.DisplayObjectContainer();
            this.walls   = new PIXI.DisplayObjectContainer();
            this.lowerEffects = new PIXI.DisplayObjectContainer();
            this.upperEffects = new PIXI.DisplayObjectContainer();

            // Add layers
            this.displayObject.addChild(this.floor);
            this.displayObject.addChild(this.shadows);
            this.displayObject.addChild(this.walls);
            this.displayObject.addChild(this.lowerEffects);

            this.initParticleView();

            this.displayObject.addChild(this.upperEffects);

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
            var finishTile = Assets.createSprite(Assets.Images.FINISH);
            finishTile.x = this.mvt.modelToViewX(level.colToX(finish.col));
            finishTile.y = this.mvt.modelToViewY(level.rowToY(finish.row));
            finishTile.scale.x = this.tileScale;
            finishTile.scale.y = this.tileScale;
            this.floor.addChild(finishTile);

            // Create the closed FINISH tile to draw over the other one
            var finishClosedTile = Assets.createSprite(Assets.Images.FINISH_CLOSED);
            finishClosedTile.x = finishTile.x;
            finishClosedTile.y = finishTile.y;
            finishClosedTile.scale.x = this.tileScale;
            finishClosedTile.scale.y = this.tileScale;
            finishClosedTile.visible = false;
            this.lowerEffects.addChild(finishClosedTile);
            this.finishClosedTile = finishClosedTile;
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
        },

        collisionsChanged: function(simulation, collisions) {
            if (collisions)
                this.finishClosedTile.visible = true;
            else
                this.finishClosedTile.visible = false;
        }

    });

    return ArenaView;
});