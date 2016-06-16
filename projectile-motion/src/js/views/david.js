define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a movable target model
     */
    var DavidView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:naked', this.updateClothedState);
        },

        initGraphics: function() {
            var davidClothed = Assets.createSprite(Assets.Images.DAVID_SHORTS);
            var davidNaked = Assets.createSprite(Assets.Images.DAVID_NO_SHORTS);
            davidNaked.visible = false;

            var width  = davidClothed.width;
            var height = davidClothed.height;
            var relativeBounds = Constants.David.BOUNDS_RELATIVE_TO_HEIGHT;

            // Get the target x anchor in pixels and then divide by the actual width to get anchor percent
            var xAnchorInPixels = (height * relativeBounds.x) + (height * relativeBounds.w) / 2;

            davidClothed.anchor.x = davidNaked.anchor.x = xAnchorInPixels / width;
            davidClothed.anchor.y = davidNaked.anchor.y = 1;

            this.displayObject.addChild(davidClothed);
            this.displayObject.addChild(davidNaked);

            this.davidClothed = davidClothed;
            this.davidNaked   = davidNaked;

            this.updateMVT(this.mvt);
        },

        updatePosition: function() {
            this.displayObject.x = this.mvt.modelToViewX(this.model.get('x'));
            this.displayObject.y = this.mvt.modelToViewY(this.model.get('y'));
        },

        updateClothedState: function(model, naked) {
            this.davidClothed.visible = !naked;
            this.davidNaked.visible = naked;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(this.model.get('height'))); // in pixels
            var scale = targetSpriteHeight / this.davidClothed.height;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            this.updatePosition();
        }

    });

    return DavidView;
});