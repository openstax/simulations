define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView   = require('common/pixi/view');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an oscillating speaker
     */
    var ListenerView = PixiView.extend({

        /**
         * Initializes the new ListenerView.
         */
        initialize: function(options) {
            this.initGraphics();

            this.updateMVT(options.mvt);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            if (Math.random() < 0.5) {
                this.person = Assets.createSprite(Assets.Images.LISTENER_FEMALE);
                this.person.anchor.y = 0.408;
            }
            else {
                this.person = Assets.createSprite(Assets.Images.LISTENER_MALE);
                this.person.anchor.y = 0.415;
            }

            this.person.anchor.x = 0.5;

            this.displayObject.addChild(this.person);
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
            this.displayObject.scale.x = this.displayObject.scale.y = scale;

            this.updatePosition();
        },

        updatePosition: function() {
            var viewPosition = this.mvt.modelToView(this.model.get('position'));
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        }

    }, Constants.ListenerView);

    return ListenerView;
});