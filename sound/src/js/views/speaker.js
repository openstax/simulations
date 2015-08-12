define(function(require) {

    'use strict';

    var PixiView               = require('common/v3/pixi/view');
    var defineInputUpdateLocks = require('common/v3/locks/define-locks');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an oscillating speaker
     */
    var SpeakerView = PixiView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',
        },

        /**
         * Initializes the new SpeakerView.
         */
        initialize: function(options) {
            this.bindToSecondOrigin = options.bindToSecondOrigin;

            this.simulation = this.model;
            this.waveMedium = this.simulation.waveMedium;
            this.personListener = this.simulation.personListener;

            this.initGraphics();

            this.updateMVT(options.mvt);

            if (this.bindToSecondOrigin)
                this.listenTo(this.personListener, 'change:origin2', this.updatePostion);
            else
                this.listenTo(this.personListener, 'change:origin', this.updatePostion);
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

            if (this.bindToSecondOrigin) {
                this.displayObject.buttonMode = true;
                this.displayObject.defaultCursor = 'ns-resize';
            }
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

            if (this.bindToSecondOrigin)
                this.updatePosition(this.personListener, this.personListener.get('origin2'));
            else
                this.updatePosition(this.personListener, this.personListener.get('origin'));
        },

        /**
         * Sets the position of the display object based on the listener's
         *   origin property, which is the location of the speaker.
         */
        updatePosition: function(personListener, origin) {
            this.updateLock(function() {
                var viewPosition = this.mvt.modelToView(origin);
                this.displayObject.x = viewPosition.x;
                this.displayObject.y = viewPosition.y;
            });
        },

        /**
         * Animates the speaker graphics
         */
        update: function(time, deltaTime, paused) {
            if (!paused) {
                this.cone.x = this.waveMedium.getAmplitudeAt(0) / Constants.MAX_AMPLITUDE * this.maxConeOffset;
            }
        },

        /**
         *
         */
        dragStart: function(event) {
            if (!this.bindToSecondOrigin)
                return;

            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        /**
         * Handles drag events to move the listener.  The original PhET source
         *   claims to be changing the pitch (frequency) of the sound according
         *   to the Doippler Effect, but the changes are either imperceptible
         *   or the code is not actually used.
         */
        drag: function(event) {
            if (!this.bindToSecondOrigin)
                return;

            if (this.dragging) {
                var dy = event.data.global.y - this.displayObject.y - this.dragOffset.y;

                var y = this.mvt.viewToModelY(this.displayObject.y + dy);

                this.displayObject.y = this.mvt.modelToViewY(y);

                this.inputLock(function() {
                    this.personListener.setOrigin2(this.personListener.get('origin2').x, y);
                });
            }
        },

        dragEnd: function(event) {
            if (!this.bindToSecondOrigin)
                return;

            this.dragging = false;
        },

    }, Constants.SpeakerView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(SpeakerView);


    return SpeakerView;
});