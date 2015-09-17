define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var ProtractorView = PixiView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd'
        },

        /**
         * Initializes the new ProtractorView.
         */
        initialize: function(options) {
            options = _.extend({
                scale: 1,
                enableRotation: false
            }, options);

            this.mvt = options.mvt;
            this.scale = options.scale;
            this.enableRotation = options.enableRotation;

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.sprite = Assets.createSprite(Assets.Images.PROTRACTOR);
            this.sprite.anchor.x = 0.5;
            this.sprite.anchor.y = 0.5;
            this.displayObject.addChild(this.sprite);
            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteWidth = this.mvt.modelToViewDeltaX(0.000012); // in pixels
            var scale = targetSpriteWidth / this.sprite.texture.width;
            this.sprite.scale.x = this.sprite.scale.y = scale * this.scale;
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = event.data.global.y - this.displayObject.y - this.dragOffset.y;
                
                this.displayObject.x += dx;
                this.displayObject.y += dy;
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });


    return ProtractorView;
});