define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var AtomicModelView = require('hydrogen-atom/views/atomic-model');

    var Constants = require('constants');
    var Assets = require('assets');
    
    /**
     * Represents the scene for the PlumPuddingModel
     */
    var PlumPuddingModelView = AtomicModelView.extend({

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            AtomicModelView.prototype.initGraphics.apply(this, arguments);

            this.plumPudding = Assets.createSprite(Assets.Images.PLUM_PUDDING);
            this.plumPudding.anchor.x = 0.5;
            this.plumPudding.anchor.y = 0.5;

            this.displayObject.addChild(this.plumPudding);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            AtomicModelView.prototype.updateMVT.apply(this, arguments);

            var viewPosition = this.getViewPosition();
            var x = viewPosition.x;
            var y = viewPosition.y;
            this.plumPudding.x = x;
            this.plumPudding.y = y;
            var viewDiameter = this.getViewDiameter() * 1.2;
            var scale = viewDiameter / this.plumPudding.texture.height;
            this.plumPudding.scale.x = scale;
            this.plumPudding.scale.y = scale;

            if (this.electronSprite)
                this.displayObject.removeChild(this.electronSprite);

            this.electronSprite = ParticleGraphicsGenerator.generateElectron(this.particleMVT);
            this.displayObject.addChild(this.electronSprite);
        },

        update: function(time, deltaTime, paused) {
            AtomicModelView.prototype.update.apply(this, arguments);

            if (this.electronSprite) {
                var viewOffset = this.mvt.modelToView(this.atom.electronPosition);
                this.electronSprite.x = viewOffset.x;
                this.electronSprite.y = viewOffset.y;
            }
        }

    });


    return PlumPuddingModelView;
});