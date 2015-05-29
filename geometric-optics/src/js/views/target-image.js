define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var ObjectView = require('views/object');

    var Constants = require('constants');
    var Types = Constants.SourceObject.Types;

    var Assets = require('assets');

    /**
     * This is the view for a TargetObject model. It can be represented
     *   as either a projected image of the original object or as a
     *   screen if the type of the source object is light.
     */
    var TargetImageView = ObjectView.extend({

        /**
         * Initializes the new ObjectView.
         */
        initialize: function(options) {
            ObjectView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:scale',    this.updateScale);
            this.listenTo(this.model, 'change:strength', this.updateStrength);
        },

        initGraphics: function() {
            ObjectView.prototype.initGraphics.apply(this, arguments);

            // Put an extra transform frame inside the picture container
            this.pictureScaleFrame = new PIXI.DisplayObjectContainer();

            while (this.pictureContainer.children.length > 0) {
                // Move the original contents of the picture container into
                //   the transform frame that is going to go inside it.
                var child = this.pictureContainer.getChildAt(0);
                this.pictureContainer.removeChild(child);
                this.pictureScaleFrame.addChild(child);
            }

            this.pictureContainer.addChild(this.pictureScaleFrame);

            // Use reversed versions of the picture images
            this.pictureSprites[Types.PICTURE_A].setTexture(Assets.Texture(Assets.Images.PICTURE_A_REVERSED));
            this.pictureSprites[Types.PICTURE_B].setTexture(Assets.Texture(Assets.Images.PICTURE_B_REVERSED));
            this.pictureSprites[Types.PICTURE_C].setTexture(Assets.Texture(Assets.Images.PICTURE_C_REVERSED));
            this.pictureSprites[Types.PICTURE_D].setTexture(Assets.Texture(Assets.Images.PICTURE_D_REVERSED));

            // Change the anchors for the reversing effect
            for (var key in this.pictureSprites) {
                this.pictureSprites[key].anchor.x = 1 - this.pictureSprites[key].anchor.x;
                this.pictureSprites[key].anchor.y = 1 - this.pictureSprites[key].anchor.y;
            }

            this.updateStrength(this.model, this.model.get('strength'));
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            ObjectView.prototype.updateMVT.apply(this, arguments);

            this.updateScale(this.model, this.model.get('scale'));
        },

        updateScale: function(targetImage, scale) {
            this.pictureScaleFrame.scale.x = this.pictureScaleFrame.scale.y = scale;
        },

        updateStrength: function(targetImage, strength) {
            this.pictureContainer.alpha = Math.min(strength, 1);
        }

    });

    return TargetImageView;
});