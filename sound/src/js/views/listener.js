define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView               = require('common/pixi/view');
    var defineInputUpdateLocks = require('common/locks/define-locks');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents a person who listens
     */
    var ListenerView = PixiView.extend({

        events: {
            'touchstart      .person': 'dragStart',
            'mousedown       .person': 'dragStart',
            'touchmove       .person': 'drag',
            'mousemove       .person': 'drag',
            'touchend        .person': 'dragEnd',
            'mouseup         .person': 'dragEnd',
            'touchendoutside .person': 'dragEnd',
            'mouseupoutside  .person': 'dragEnd',
        },

        /**
         * Initializes the new ListenerView.
         */
        initialize: function(options) {
            options = _.extend({
                disableYMovement: true
            }, options);

            this.disableYMovement = options.disableYMovement;

            this.initGraphics();

            this.updateMVT(options.mvt);

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            if (Math.random() < 0.5) {
                this.person = Assets.createSprite(Assets.Images.LISTENER_FEMALE);
                this.person.anchor.x = 0.1;
                this.person.anchor.y = 0.408;
            }
            else {
                this.person = Assets.createSprite(Assets.Images.LISTENER_MALE);
                this.person.anchor.x = 0.1;
                this.person.anchor.y = 0.415;
            }

            this.displayObject.addChild(this.person);
            this.person.buttonMode = true;
            if (this.disableYMovement)
                this.person.defaultCursor = 'ew-resize';
            else
                this.person.defaultCursor = 'move';
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

            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(ListenerView.HEIGHT_IN_METERS)); // In pixels
            var scale = targetSpriteHeight / this.person.texture.height;
            this.person.scale.x = this.person.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(body, position) {
            this.updateLock(function() {
                var viewPosition = this.mvt.modelToView(position);
                this.displayObject.x = viewPosition.x;
                this.displayObject.y = viewPosition.y;
            });
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        /**
         * Handles drag events to move the listener.  The original PhET source
         *   claims to be changing the pitch (frequency) of the sound according
         *   to the Doippler Effect, but the changes are either imperceptible
         *   or the code is not actually used.
         */
        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;

                var x = this.mvt.viewToModelX(this.displayObject.x + dx);
                var y = this.mvt.viewToModelY(this.displayObject.y + dy);

                if (x < ListenerView.MIN_X_IN_METERS)
                    x = ListenerView.MIN_X_IN_METERS;
                else if (x > ListenerView.MAX_X_IN_METERS)
                    x = ListenerView.MAX_X_IN_METERS;

                this.displayObject.x = this.mvt.modelToViewX(x);
                if (!this.disableYMovement)
                    this.displayObject.y = this.mvt.modelToViewY(y);

                this.inputLock(function() {
                    this.model.setX(x);
                    if (!this.disableYMovement)
                        this.model.setY(y);
                });
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

    }, Constants.ListenerView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(ListenerView);


    return ListenerView;
});