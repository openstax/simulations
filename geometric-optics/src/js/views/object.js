define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');

    var Constants = require('constants');
    var Types = Constants.SourceObject.Types;

    var Assets = require('assets');

    /**
     * This is a base class for both the TargetImageView and SourceObjectView.
     *   The target image is basically the same as the source object in looks
     *   but adds and subtracts certain features.
     */
    var ObjectView = PixiView.extend({

        /**
         * Initializes the new ObjectView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
            this.updateMVT(this.mvt);

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:type',     this.updateType);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            this.pictureContainer = new PIXI.DisplayObjectContainer();
            this.displayObject.addChild(this.pictureContainer);

            this.pictureSprites = [];
            this.pictureSprites[Types.PICTURE_A] = Assets.createSprite(Assets.Images.PICTURE_A);
            this.pictureSprites[Types.PICTURE_B] = Assets.createSprite(Assets.Images.PICTURE_B);
            this.pictureSprites[Types.PICTURE_C] = Assets.createSprite(Assets.Images.PICTURE_C);
            this.pictureSprites[Types.PICTURE_D] = Assets.createSprite(Assets.Images.PICTURE_D);

            for (var key in this.pictureSprites) {
                this.pictureContainer.addChild(this.pictureSprites[key]);
                this.pictureSprites[key].visible = false;
                this.pictureSprites[key].anchor.x = 0.6;
                this.pictureSprites[key].anchor.y = 0.2;
            }

            this.updateType(this.model, this.model.get('type'));
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updatePictureContainerScale();
            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePictureContainerScale: function() {
            this.pictureContainer.scale.x = this.pictureContainer.scale.y = this.getPictureContainerScale();
        },

        updatePosition: function(object, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.pictureContainer.x = viewPosition.x;
            this.pictureContainer.y = viewPosition.y;
        },

        updateType: function(object, type) {
            this.hidePictureSprites();

            switch (type) {
                case Types.PICTURE_A:
                case Types.PICTURE_B:
                case Types.PICTURE_C:
                case Types.PICTURE_D:
                    this.pictureSprites[type].visible = true;
                    break;
            }
        },

        hidePictureSprites: function() {
            for (var key in this.pictureSprites)
                this.pictureSprites[key].visible = false;
        },

        getPictureContainerScale: function() {
            // Get the height we want in pixels to compare to the height of the texture
            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(ObjectView.PICTURE_A_HEIGHT_IN_METERS));
            var scale = targetSpriteHeight / this.pictureSprites[Types.PICTURE_A].texture.height;
            return scale;
        }

    }, Constants.ObjectView);

    return ObjectView;
});