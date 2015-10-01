define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var Assets = require('assets');
    var Constants = require('constants');
    var STICK_COLOR = Colors.parseHex(Constants.TurnstileView.STICK_COLOR);

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
            this.stick = new PIXI.Graphics();

            this.pinwheel = Assets.createSprite(Assets.Images.PINWHEEL);
            this.pinwheel.anchor.x = 0.5;
            this.pinwheel.anchor.y = 0.5;

            this.displayObject.addChild(this.stick);
            this.displayObject.addChild(this.pinwheel);

            this.updateMVT(this.mvt);
        },

        drawStick: function() {
            var width  = Math.round(this.mvt.modelToViewDeltaX(TurnstileView.STICK_WIDTH) / 2) * 2;
            var height = Math.round(this.mvt.modelToViewDeltaY(TurnstileView.STICK_HEIGHT));
            var graphics = this.stick;
            graphics.clear();
            graphics.beginFill(STICK_COLOR, 1);
            graphics.drawRect(-width / 2, 0, width, height);
            graphics.endFill();
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

            this.drawStick();

            this.update();
        },

        updateRotation: function(model, rotation) {
            this.pinwheel.rotation = rotation;
        },

        update: function() {
            this.updateRotation(this.model, this.model.angle);
        }

    }, Constants.TurnstileView);


    return TurnstileView;
});