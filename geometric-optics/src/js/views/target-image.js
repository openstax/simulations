define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var ObjectView = require('views/object');

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
            this.listenTo(this.model, 'change:reversed',  this.updateReversed);

            this.updateReversed(this.model, this.model.get('reversed'));
        },

        initGraphics: function() {
            ObjectView.prototype.initGraphics.apply(this, arguments);

            // Put two more transform frames inside the picture container
            //   around its contents.
            this.pictureRotationFrame = new PIXI.DisplayObjectContainer();
            this.pictureScaleFrame    = new PIXI.DisplayObjectContainer();

            while (this.pictureContainer.children.length > 0) {
                // Move the original contents of the picture container from
                //   the top level into the bottom level transform frame
                var child = this.pictureContainer.getChildAt(0);
                this.pictureContainer.removeChild(child);
                this.pictureScaleFrame.addChild(child);
            }

            this.pictureRotationFrame.addChild(this.pictureScaleFrame);
            this.pictureContainer.addChild(this.pictureRotationFrame);
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
            this.pictureContainer.alpha = strength;
        },

        updateReversed: function(targetImage, reversed) {
            var rotation = reversed ? Math.PI : 0;
            this.pictureRotationFrame.rotation = rotation;
        }

    });

    return TargetImageView;
});