define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a movable target model
     */
    var ArenaView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

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


            // Find and create the FINISH tile
        },

        drawWalls: function() {
            this.shadows.removeChildren();
            this.walls.removeChildren();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.tileSize = this.mvt.modelToViewDeltaX(Constants.TILE_SIZE);

            this.drawLevel();
        }

    });

    return ArenaView;
});