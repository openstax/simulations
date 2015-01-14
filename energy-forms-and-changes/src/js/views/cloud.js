define(function(require) {

    'use strict';

    var PositionableView = require('views/positionable');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an element model
     */
    var CloudView = PositionableView.extend({

        /**
         *
         */
        initialize: function(options) {
            PositionableView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:existenceStrength', this.updateAlpha);
            this.updateAlpha(this.model, this.model.get('existenceStrength'));
        },

        initGraphics: function() {
            var sprite = Assets.createSprite(Assets.Images.CLOUD_1);
            sprite.anchor.x = sprite.anchor.y = 0.5;

            var scale = this.mvt.modelToViewDeltaX(Constants.Cloud.CLOUD_WIDTH) / sprite.width;
            sprite.scale.x = sprite.scale.y = scale;

            this.displayObject.addChild(sprite);
        },

        updateAlpha: function(model, alpha) {
            this.displayObject.alpha = alpha;
        }

    });

    return CloudView;
});