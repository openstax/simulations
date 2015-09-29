define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    
    var Assets = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents an electron
     */
    var TurnstileView = PixiView.extend({

        /**
         * Initializes the new TurnstileView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            var stick = new PIXI.Graphics();

            

            var pinwheel = Assets.createSprite(Assets.Images.PINWHEEL);
            pinwheel.anchor.x = 0.5;
            pinwheel.anchor.y = 0.5;
            this.pinwheel = pinwheel;

            this.displayObject.addChild(stick);
            this.displayObject.addChild(pinwheel);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(TurnstileView.PINWHEEL_MODEL_WIDTH));
            var scale = targetWidth / this.pinwheel.texture.width;
            this.pinwheel.scale.x = scale;
            this.pinwheel.scale.y = scale;

            this.displayObject.x = Math.floor(this.mvt.modelToViewX(this.model.center.x));
            this.displayObject.y = Math.floor(this.mvt.modelToViewY(this.model.center.y));

            this.update();
        },

        updateRotation: function(model, rotation) {
            this.pinwheel.rotation = rotation
        },

        update: function() {
            this.updateRotation(this.model, this.model.angle);
        }

    }, Constants.TurnstileView);


    return TurnstileView;
});