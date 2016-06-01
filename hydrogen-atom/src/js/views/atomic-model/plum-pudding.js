define(function(require) {

    'use strict';

    var PIXI = require('pixi');

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
            this.plumPudding.x = viewPosition.x;
            this.plumPudding.y = viewPosition.y;
            var viewDiameter = this.getViewDiameter();
            var scale = viewDiameter / this.plumPudding.texture.height;
            this.plumPudding.scale.x = scale;
            this.plumPudding.scale.y = scale;
        }

    });


    return PlumPuddingModelView;
});