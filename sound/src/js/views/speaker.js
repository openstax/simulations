define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView   = require('common/pixi/view');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an oscillating speaker
     */
    var SpeakerView = PixiView.extend({

        /**
         * Initializes the new SpeakerView.
         */
        initialize: function(options) {
            this.initGraphics();

            this.updateMVT(options.mvt);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            this.magnet   = Assets.createSprite(Assets.Images.SPEAKER_MAGNET);
            this.cone     = Assets.createSprite(Assets.Images.SPEAKER_CONE);
            this.surround = Assets.createSprite(Assets.Images.SPEAKER_SURROUND);

            var xAnchor = 0;
            var yAnchor = 0.5;

            this.magnet.anchor.x   = xAnchor;
            this.cone.anchor.x     = xAnchor;
            this.surround.anchor.x = xAnchor;

            this.magnet.anchor.y   = yAnchor;
            this.cone.anchor.y     = yAnchor;
            this.surround.anchor.y = yAnchor;

            this.displayObject.addChild(this.magnet);
            this.displayObject.addChild(this.cone);
            this.displayObject.addChild(this.surround);
        },

        /**
         *
         */
        reset: function() {

        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(SpeakerView.HEIGHT_IN_METERS)); // In pixels
            var scale = targetSpriteHeight / this.magnet.texture.height;
            this.displayObject.scale.x = this.displayObject.scale.y = scale;

            this.maxConeOffset = this.mvt.modelToViewDeltaX(SpeakerView.CONE_MAX_OFFSET_IN_METERS);
        },

        /**
         * Animates the speaker graphics
         */
        update: function(time, deltaTime, paused) {
            if (!paused) {
                this.cone.x = this.model.getAmplitudeAt(0) / Constants.MAX_AMPLITUDE * this.maxConeOffset;
            }
        }

    }, Constants.SpeakerView);

    return SpeakerView;
});