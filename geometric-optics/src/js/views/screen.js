// I could probably use a second copy of the screen image as a clipping mask
//   so that the light spots only shine on the screen itself and don't float
//   oddly in the air.  That or I can make an actual mask image that is just
//   the screen part of the screen.

define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');

    var Constants = require('constants');
    var Types = Constants.SourceObject.Types;

    var Assets = require('assets');

    /**
     * 
     */
    var ScreenView = PixiView.extend({

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
         * Initializes the new ScreenView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
            this.updateMVT(this.mvt);

            this.listenTo(this.model, 'change:type',        this.typeChanged);
            this.listenTo(this.model, 'change:position',    this.updatePosition);
            this.listenTo(this.model, 'change:secondPoint', this.updateSecondPoint);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            this.initTextures();
            this.initLayers();
            this.initLightSpots();

            this.hide();
        },

        initTextures: function() {
            var baseTexture = Assets.Texture(Assets.Images.SCREEN).baseTexture;

            var width  = baseTexture.width;
            var height = baseTexture.height;
            var dividingX = 112; // Pixels (a little less than half the image width)

            this.leftTexture  = new PIXI.Texture(baseTexture, new PIXI.Rectangle(0,         0,         dividingX, height));
            this.rightTexture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(dividingX, 0, width - dividingX, height));
        },

        initLayers: function() {
            var screenBack  = new PIXI.Sprite(Assets.Texture(Assets.Images.SCREEN));
            var screenFront = new PIXI.Sprite(this.rightTexture);

            screenBack.anchor.y = screenFront.anchor.y = 0.52;

            // The back texture is the full texture but centered on the
            //   dividing area, whereas the front texture is only the
            //   right side of the texture on top of the back with some
            //   transparency, to make it so we can see the rays going
            //   through it.
            screenBack.anchor.x = (this.rightTexture.baseTexture.width - this.rightTexture.width) / this.rightTexture.baseTexture.width;
            screenFront.alpha = 0.9;

            this.backLayer  = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            this.backLayer.addChild(screenBack);
            this.frontLayer.addChild(screenFront);

            this.screenBack = screenBack;
            this.screenFront = screenFront;
        },

        initLightSpots: function() {
            var backMask = new PIXI.Sprite(this.leftTexture);
            var frontMask = new PIXI.Sprite(this.rightTexture);

            this.spot1Back  = new PIXI.Graphics();
            this.spot1Front = new PIXI.Graphics();

            // this.spot1Back.mask = backMask;
            // this.spot1Front.mask = frontMask;

            this.backLayer.addChild(this.spot1Back);
            this.frontLayer.addChild(this.spot1Front);
        },

        /**
         * Draws a single light spot
         */
        drawLightSpot: function(backGraphics, frontGraphics, targetPoint) {

        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.screenBack, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.screenBack.x - this.dragOffset.x;
                var dy = data.global.y - this.screenBack.y - this.dragOffset.y;
                
                this.screenBack.x += dx;
                this.screenBack.y += dy;
                this.screenFront.x += dx;
                this.screenFront.y += dy;
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(ScreenView.SCREEN_HEIGHT_IN_METERS));
            var scale = targetSpriteHeight / this.rightTexture.height;
            this.screenBack.scale.x = scale;
            this.screenBack.scale.y = scale;
            this.screenFront.scale.x = scale;
            this.screenFront.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(targetImage, position) {
            var viewPosition = this.mvt.modelToView(position);
            // Calculate the position of the first light spot
        },

        updateSecondPoint: function(targetImage, secondPoint) {
            // Calculate the position of the second light spot
        },

        typeChanged: function(targetImage, type) {
            if (type === Types.LIGHT)
                this.show();
            else
                this.hide();
        },

        show: function() {
            this.backLayer.visible = true;
            this.frontLayer.visible = true;
        },

        hide: function() {
            this.backLayer.visible = false;
            this.frontLayer.visible = false;
        }

    }, Constants.ScreenView);

    return ScreenView;
});