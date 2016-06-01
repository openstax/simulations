define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AtomicModelView = require('hydrogen-atom/views/atomic-model');

    var Constants = require('constants');
    var Assets = require('assets');
    
    /**
     * Represents the scene for the BilliardBallModel
     */
    var BilliardBallModelView = AtomicModelView.extend({

        /**
         * Initializes the new BilliardBallModelView.
         */
        initialize: function(options) {
            AtomicModelView.prototype.initialize.apply(this, arguments);

            this.hide();
        },

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

            var viewPosition = this.mvt.modelToView(this.simulation.atom.get('position'));
            this.billiardBall.x = viewPosition.x;
            this.billiardBall.y = viewPosition.y;
            var viewDiameter = this.mvt.modelToViewDeltaX(this.simulation.atom.get('radius') * 2);
            var scale = viewDiameter / this.billiardBall.texture.width;
            this.billiardBall.scale.x = scale;
            this.billiardBall.scale.y = scale;
        },

        update: function(time, deltaTime, paused) {
            AtomicModelView.prototype.update.apply(this, arguments);
        }

    });


    return BilliardBallModelView;
});