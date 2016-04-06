define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * Represents the aging rock that flies out of the volcano, lands in the foreground, and
     *   then cools so it can be dated.
     */
    var AgingRockView = PixiView.extend({

        /**
         * Initializes the new AgingRockView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.time = 0;

            this.initGraphics();

            this.listenTo(this.model, 'change:cooledPercent', this.updateGraphics);
            this.listenTo(this.model, 'change:width',         this.updateScale);
            this.listenTo(this.model, 'change:position',      this.updatePosition);
            this.listenTo(this.model, 'change:rotation',      this.updateRotation);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.textures = [
                Assets.Texture(Assets.Images.ROCK_A_0), // Molten
                Assets.Texture(Assets.Images.ROCK_A_1), // Hot
                Assets.Texture(Assets.Images.ROCK_A_2)  // Cool
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
            var cooledPercent = this.model.get('cooledPercent');
            var midwayPercent = 0.5;

            if (cooledPercent < midwayPercent)
                this.showTextures(0, 1, cooledPercent / midwayPercent);
            else
                this.showTextures(1, 2, (cooledPercent - midwayPercent) / (1 - midwayPercent));

            if (cooledPercent === 1)
                this.sprite1.visible = false;
        },

        showTextures: function(texture1Index, texture2Index, percentOfTexture2) {
            this.sprite1.texture = this.textures[texture1Index];
            this.sprite2.texture = this.textures[texture2Index];
            this.sprite2.alpha = percentOfTexture2;
        },

        updateScale: function() {
            var targetWidth = this.mvt.modelToViewDeltaX(this.model.get('width'));
            var scale = targetWidth / this.textures[0].width;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            var heightWidthRatio =  this.textures[0].height / this.textures[0].width;
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

    }, Constants.AgingRockView);


    return AgingRockView;
});