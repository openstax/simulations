define(function(require) {

    'use strict';

    var AtomicModelView = require('hydrogen-atom/views/atomic-model');

    var Assets = require('assets');
    
    /**
     * Represents the scene for the BilliardBallModel
     */
    var BilliardBallModelView = AtomicModelView.extend({

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            AtomicModelView.prototype.initGraphics.apply(this, arguments);

            this.billiardBall = Assets.createSprite(Assets.Images.SPHERE);
            this.billiardBall.anchor.x = 0.5;
            this.billiardBall.anchor.y = 0.5;
            this.billiardBall.tint = 0xFF8D00;

            this.displayObject.addChild(this.billiardBall);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            AtomicModelView.prototype.updateMVT.apply(this, arguments);

            var viewPosition = this.getViewPosition();
            this.billiardBall.x = viewPosition.x;
            this.billiardBall.y = viewPosition.y;
            var viewDiameter = this.getViewDiameter();
            var scale = viewDiameter / this.billiardBall.texture.width;
            this.billiardBall.scale.x = scale;
            this.billiardBall.scale.y = scale;
        }

    });


    return BilliardBallModelView;
});