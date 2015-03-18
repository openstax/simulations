define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Level = require('models/level');

    var Assets = require('assets');

    // var FLOOR_TILES = [
    //     Assets.Images.FLOOR_1,
    //     Assets.Images.FLOOR_2,
    //     Assets.Images.FLOOR_3
    // ];

    var Constants = require('constants');

    /**
     * A view that represents a movable target model
     */
    var ArenaView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;
            this.bounds = options.bounds || new Rectangle();

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

            this.updateMVT(this.mvt);
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
            var modelXDistanceFromCenter = Math.abs(this.mvt.viewToModelX(0));
            var modelYDistanceFromCenter = Math.abs(this.mvt.viewToModelY(0));
            var xTilesFromCenter = Math.ceil(modelXDistanceFromCenter / Constants.TILE_SIZE);
            var yTilesFromCenter = Math.ceil(modelYDistanceFromCenter / Constants.TILE_SIZE);

            var tileSprite;
            for (var x = -xTilesFromCenter; x < xTilesFromCenter; x++) {
                for (var y = -yTilesFromCenter; y < yTilesFromCenter; y++) {
                    tileSprite = Assets.createSprite(Assets.Images.FLOOR);
                    tileSprite.x = this.mvt.modelToViewX(x * Constants.TILE_SIZE);
                    tileSprite.y = this.mvt.modelToViewY(y * Constants.TILE_SIZE);
                    tileSprite.scale.x = this.tileScale;
                    tileSprite.scale.y = this.tileScale;
                    this.floor.addChild(tileSprite);
                }
            }

            // Find and create the FINISH tile
            var level = this.model.get('level');
            var data = level.data;
            for (var r = 0; r < data.length; r++) {
                for (var c = 0; c < data[r].length; c++) {
                    if (data[r][c] === Level.TILE_FINISH) {
                        tileSprite = Assets.createSprite(Assets.Images.FINISH);
                        tileSprite.x = this.mvt.modelToViewX(level.colToX(c));
                        tileSprite.y = this.mvt.modelToViewY(level.rowToY(r));
                        tileSprite.scale.x = this.tileScale;
                        tileSprite.scale.y = this.tileScale;
                        this.floor.addChild(tileSprite);
                    }
                }
            }
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

        randomFloorImage: function() {
            return FLOOR_TILES[Math.floor(Math.random() * FLOOR_TILES.length)];
        }

    });

    return ArenaView;
});