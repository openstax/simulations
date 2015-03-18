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




            // Cache each layer because they don't change
            this.floor.cacheAsBitmap   = true;
            this.shadows.cacheAsBitmap = true;
            this.walls.cacheAsBitmap   = true;
        },

        drawFloor: function() {

        },

        drawWalls: function() {

        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(this.model.get('height'))); // in pixels
            // var scale = targetSpriteHeight / this.davidClothed.height;
            // this.displayObject.scale.x = scale;
            // this.displayObject.scale.y = scale;

            this.drawLevel();
        }

    });

    return ArenaView;
});