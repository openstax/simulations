define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * Represents the aging tree that grows up, dies, and falls over.
     */
    var AgingTreeView = PixiView.extend({

        /**
         * Initializes the new AgingTreeView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.time = 0;

            this.initGraphics();

            this.listenTo(this.model, 'change:dead change:decomposed', this.updateGraphics);
            this.listenTo(this.model, 'change:width',    this.updateScale);
            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:rotation', this.updateRotation);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.textures = [
                Assets.Texture(Assets.Images.TREE_1), // Leafed
                Assets.Texture(Assets.Images.TREE_2), // Bare
                Assets.Texture(Assets.Images.TREE_3)  // Dead
            ];

            this.sprite1 = new PIXI.Sprite(this.textures[0]);
            this.sprite2 = new PIXI.Sprite(this.textures[0]);

            this.sprite1.anchor.x = this.sprite1.anchor.y = 0.5;
            this.sprite2.anchor.x = this.sprite2.anchor.y = 0.5;

            this.displayObject.addChild(this.sprite1);
            this.displayObject.addChild(this.sprite2);

            this.updateGraphics();
            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateScale();
            this.updatePosition(this.model, this.model.get('position'));
        },

        /**
         * Determines how much of each texture should be showing
         */
        updateGraphics: function() {
            var dead = this.model.get('dead');
            var decomposed = this.model.get('decomposed');

            if (dead < 1)
                this.fadeTextures(0, 1, dead);
            else
                this.fadeOutTexture(1, 2, decomposed);
        },

        fadeTextures: function(texture1Index, texture2Index, percentOfTexture2) {
            this.sprite1.texture = this.textures[texture1Index];
            this.sprite1.alpha = 1 - percentOfTexture2;
            this.sprite2.texture = this.textures[texture2Index];
            this.sprite2.alpha = percentOfTexture2;
        },

        fadeOutTexture: function(texture1Index, texture2Index, percentOfTexture2) {
            this.sprite1.texture = this.textures[texture1Index];
            this.sprite1.alpha = 1 - percentOfTexture2;
            this.sprite2.texture = this.textures[texture2Index];
            this.sprite2.alpha = 1;
        },

        updateScale: function() {
            var targetWidth = this.mvt.modelToViewDeltaX(this.model.get('width'));
            var scale = targetWidth / this.textures[0].width;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            var heightWidthRatio = this.textures[0].height / this.textures[0].width;
            this.model.set('height', this.model.get('width') * heightWidthRatio);
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        updateRotation: function(model, rotation) {
            this.displayObject.rotation = rotation
        }

    });

    return AgingTreeView;
});