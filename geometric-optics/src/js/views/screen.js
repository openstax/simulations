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
            'touchstart      .screenBack': 'dragStart',
            'mousedown       .screenBack': 'dragStart',
            'touchmove       .screenBack': 'drag',
            'mousemove       .screenBack': 'drag',
            'touchend        .screenBack': 'dragEnd',
            'mouseup         .screenBack': 'dragEnd',
            'touchendoutside .screenBack': 'dragEnd',
            'mouseupoutside  .screenBack': 'dragEnd'
        },

        /**
         * Initializes the new ScreenView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
            this.updateMVT(this.mvt);

            this.lastPosition = new PIXI.Point();

            // Listen for changes in the target image
            this.listenTo(this.model, 'change:type',        this.typeChanged);
            this.listenTo(this.model, 'change:position',    this.updatePosition);
            this.listenTo(this.model, 'change:secondPoint', this.updateSecondPoint);

            // Listen for changes in the lens
            this.listenTo(this.model.lens, 'change:diameter', this.drawLightSpots);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            this.initTextures();
            this.initLayers();
            this.initLightSpots();

            this.hide();
            this.hideSecondPoint();
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

            // Center it vertically on the screen part of the graphic
            screenBack.anchor.y = screenFront.anchor.y = 0.52;

            // The back texture is the full texture but centered on the
            //   dividing area, whereas the front texture is only the
            //   right side of the texture on top of the back with some
            //   transparency, to make it so we can see the rays going
            //   through it.
            screenBack.anchor.x = (this.rightTexture.baseTexture.width - this.rightTexture.width) / this.rightTexture.baseTexture.width;
            screenFront.alpha = 0.9;

            // Pointer cursor
            screenBack.buttonMode = true;

            this.backLayer  = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            this.backLayer.addChild(screenBack);
            this.frontLayer.addChild(screenFront);

            this.screenBack = screenBack;
            this.screenFront = screenFront;
        },

        initLightSpots: function() {
            // Create masks
            this.backMask = new PIXI.Graphics();
            this.frontMask = new PIXI.Graphics();

            var anchorX = this.screenBack.anchor.x;
            var anchorY = this.screenBack.anchor.y;

            var xOffset = this.screenBack.texture.width * anchorX;
            var yOffset = this.screenBack.texture.height * anchorY;

            var centerPercent = (xOffset - ScreenView.MASK_TL_CORNER.x) / (ScreenView.MASK_TR_CORNER.x - ScreenView.MASK_TL_CORNER.x);
            var topCenter    = ScreenView.MASK_TL_CORNER.y * (1 - centerPercent) + ScreenView.MASK_TR_CORNER.y * centerPercent;
            var bottomCenter = ScreenView.MASK_BL_CORNER.y * (1 - centerPercent) + ScreenView.MASK_BR_CORNER.y * centerPercent;
            
            this.backMask.beginFill(0xFF0000, 0.8);
            this.backMask.moveTo(ScreenView.MASK_TL_CORNER.x - xOffset, ScreenView.MASK_TL_CORNER.y - yOffset);
            this.backMask.lineTo(0, topCenter - yOffset);
            this.backMask.lineTo(0, bottomCenter - yOffset);
            this.backMask.lineTo(ScreenView.MASK_BL_CORNER.x - xOffset, ScreenView.MASK_BL_CORNER.y - yOffset);
            this.backMask.endFill();

            this.frontMask.beginFill(0xFFFF00, 0.8);
            this.frontMask.moveTo(ScreenView.MASK_TR_CORNER.x - xOffset, ScreenView.MASK_TR_CORNER.y - yOffset);
            this.frontMask.lineTo(0, topCenter - yOffset);
            this.frontMask.lineTo(0, bottomCenter - yOffset);
            this.frontMask.lineTo(ScreenView.MASK_BR_CORNER.x - xOffset, ScreenView.MASK_BR_CORNER.y - yOffset);
            this.frontMask.endFill();

            this.backLayer.addChild(this.backMask);
            this.frontLayer.addChild(this.frontMask);

            // Create lights
            this.spot1Back  = new PIXI.Graphics();
            this.spot1Front = new PIXI.Graphics();
            this.spot2Back  = new PIXI.Graphics();
            this.spot2Front = new PIXI.Graphics();

            this.spot1Back.mask = this.backMask;
            this.spot1Front.mask = this.frontMask;
            this.spot2Back.mask = this.backMask;
            this.spot2Front.mask = this.frontMask;

            this.backLayer.addChild(this.spot1Back);
            this.frontLayer.addChild(this.spot1Front);
            this.backLayer.addChild(this.spot2Back);
            this.frontLayer.addChild(this.spot2Front);
        },

        /**
         * Draws both light spots
         */
        drawLightSpots: function() {
            this.drawLightSpot(this.spot1Back, this.spot1Front, this.model.get('position'));
            this.drawLightSpot(this.spot2Back, this.spot2Front, this.model.get('secondPoint'));
        },

        /**
         * Draws a single light spot
         */
        drawLightSpot: function(backGraphics, frontGraphics, targetPoint) {
            var Bx = this.mvt.modelToViewX(this.model.lens.get('position').x);
            var By = this.mvt.modelToViewY(this.model.lens.get('position').y);

            var Cx = this.mvt.modelToViewX(targetPoint.x);
            var Cy = this.mvt.modelToViewY(targetPoint.y);

            var Sx = this.screenBack.x;

            var h = Math.abs(this.mvt.modelToViewDeltaY(this.model.lens.get('diameter')));

            var y = Cy + ((Cy - By) / (Cx - Bx)) * (Sx - Cx);

            var height = h * Math.abs((Sx - Cx) / (Cx - Bx)) + 4;
            var width = 0.3 * height;
            var alpha = Math.min(1, Math.max(0, this.fullBrightSpotHeight / height));

            backGraphics.clear();
            backGraphics.beginFill(0xFFFFFF, alpha);
            backGraphics.drawEllipse(Sx, y, width / 2, height / 2);
            backGraphics.endFill();

            frontGraphics.clear();
            frontGraphics.beginFill(0xFFFFFF, alpha);
            frontGraphics.drawEllipse(Sx, y, width / 2, height / 2);
            frontGraphics.endFill();
        },

        dragStart: function(data) {
            this.lastPosition.x = data.global.x;
            this.lastPosition.y = data.global.y;

            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.lastPosition.x;
                var dy = data.global.y - this.lastPosition.y;

                this.translate(dx, dy);

                this.lastPosition.x = data.global.x;
                this.lastPosition.y = data.global.y;
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
            this.backMask.scale.x = scale;
            this.backMask.scale.y = scale;
            this.frontMask.scale.x = scale;
            this.frontMask.scale.y = scale;

            this.fullBrightSpotHeight = this.mvt.modelToViewDeltaX(ScreenView.FULL_BRIGHT_SPOT_HEIGHT);

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(targetImage, position) {
            this.drawLightSpot(this.spot1Back, this.spot1Front, position);
        },

        updateSecondPoint: function(targetImage, secondPoint) {
            this.drawLightSpot(this.spot2Back, this.spot2Front, secondPoint);
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
        },

        showSecondPoint: function() {
            this.spot2Back.visible = true;
            this.spot2Front.visible = true;
        },

        hideSecondPoint: function() {
            this.spot2Back.visible = false;
            this.spot2Front.visible = false;
        },

        setPosition: function(x, y) {
            this.screenBack.x = x;
            this.screenBack.y = y;
            this.screenFront.x = x;
            this.screenFront.y = y;
            this.backMask.x = x;
            this.backMask.y = y;
            this.frontMask.x = x;
            this.frontMask.y = y;

            this.drawLightSpots();
        },

        translate: function(dx, dy) {
            this.screenBack.x += dx;
            this.screenBack.y += dy;
            this.screenFront.x += dx;
            this.screenFront.y += dy;
            this.backMask.x += dx;
            this.backMask.y += dy;
            this.frontMask.x += dx;
            this.frontMask.y += dy;

            this.drawLightSpots();
        },

    }, Constants.ScreenView);

    return ScreenView;
});