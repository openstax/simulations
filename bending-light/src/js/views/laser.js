define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
                   require('common/pixi/draw-arrow');
    var Colors   = require('common/colors/colors');
    var range    = require('common/math/range');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');
    var RADIANS_TO_DEGREES = 180 / Math.PI;

    /**
     * A view that represents a cannon model
     */
    var LaserView = PixiView.extend({

        events: {
            'touchstart      .translateArea': 'dragTranslateAreaStart',
            'mousedown       .translateArea': 'dragTranslateAreaStart',
            'touchmove       .translateArea': 'dragTranslateArea',
            'mousemove       .translateArea': 'dragTranslateArea',
            'touchend        .translateArea': 'dragTranslateAreaEnd',
            'mouseup         .translateArea': 'dragTranslateAreaEnd',
            'touchendoutside .translateArea': 'dragTranslateAreaEnd',
            'mouseupoutside  .translateArea': 'dragTranslateAreaEnd',
            'mouseover       .translateArea': 'translateAreaHover',
            'mouseout        .translateArea': 'translateAreaUnhover',

            'touchstart      .rotateArea': 'dragRotateAreaStart',
            'mousedown       .rotateArea': 'dragRotateAreaStart',
            'touchmove       .rotateArea': 'dragRotateArea',
            'mousemove       .rotateArea': 'dragRotateArea',
            'touchend        .rotateArea': 'dragRotateAreaEnd',
            'mouseup         .rotateArea': 'dragRotateAreaEnd',
            'touchendoutside .rotateArea': 'dragRotateAreaEnd',
            'mouseupoutside  .rotateArea': 'dragRotateAreaEnd',
            'mouseover       .rotateArea': 'rotateAreaHover',
            'mouseout        .rotateArea': 'rotateAreaUnhover',

            'click .button': 'buttonClicked'
        },

        /**
         *
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.rotateOnly = options.rotateOnly;

            this.arrowTailWidth = 12;
            this.arrowHeadWidth = 24;
            this.arrowHeadLength = 20;
            this.arrowColor = 0x81E4AA;

            this.initGraphics();

            this._initialPosition = new Vector2();

            this.listenTo(this.model, 'change:on', this.onChanged);
            this.listenTo(this.model, 'change:emissionPoint', this.update);
        },

        initGraphics: function() {
            this.rotationFrame = new PIXI.DisplayObjectContainer();

            this.initSprites();
            this.initRotationArrows();
            this.initTranslationArrows();
            this.initDragAreas();
            this.initButton();

            this.updateMVT(this.mvt);
        },

        initSprites: function() {
            this.onSprite  = Assets.createSprite(Assets.Images.LASER_ON);
            this.offSprite = Assets.createSprite(Assets.Images.LASER_OFF);

            this.onSprite.visible = false;
            this.onSprite.anchor.x = this.offSprite.anchor.x = 1;
            this.onSprite.anchor.y = this.offSprite.anchor.y = 0.5;

            this.spriteWidth  = this.onSprite.texture.width;
            this.spriteHeight = this.onSprite.texture.height;

            this.rotationFrame.addChild(this.onSprite);
            this.rotationFrame.addChild(this.offSprite);

            this.displayObject.addChild(this.rotationFrame);
        },

        initRotationArrows: function() {
            this.rotationArrows = new PIXI.Graphics();
            this.rotationArrows.visible = false;

            var startX = -this.spriteWidth + this.spriteWidth * 0.19;
            var endX   = -this.spriteWidth + this.spriteWidth * 0.24;
            var yExtent = this.spriteHeight * 1.2;

            this.rotationArrows.beginFill(this.arrowColor, 1);
            this.rotationArrows.drawArrow(
                startX, 0,
                endX,   yExtent,
                this.arrowTailWidth, 
                this.arrowHeadWidth, 
                this.arrowHeadLength
            );
            this.rotationArrows.endFill();

            this.rotationArrows.beginFill(this.arrowColor, 1);
            this.rotationArrows.drawArrow(
                startX, 0,
                endX,   -yExtent,
                this.arrowTailWidth, 
                this.arrowHeadWidth, 
                this.arrowHeadLength
            );
            this.rotationArrows.endFill();

            this.rotationFrame.addChildAt(this.rotationArrows, 0);
        },

        initTranslationArrows: function() {
            this.translationArrows = new PIXI.Graphics();
            this.translationArrows.visible = false;

            // We'll draw them later, because they need to be at the center
            //   of the rotated body but not be rotated, so it has to be
            //   calculated based off of the rotation of the body.

            this.displayObject.addChildAt(this.translationArrows, 0);
        },

        initDragAreas: function() {
            
            var bodyArea = new PIXI.Rectangle(-this.spriteWidth, -this.spriteHeight / 2, this.spriteWidth, this.spriteHeight);

            if (!this.rotateOnly) {
                // Make the body the handle for translation
                this.translateArea = new PIXI.DisplayObjectContainer();
                this.translateArea.hitArea = bodyArea;
                this.translateArea.buttonMode = true;
                this.translateArea.defaultCursor = 'move';
                this.rotationFrame.addChild(this.translateArea);

                // Create a special rotation handle off the back end
                this.initRotateHandle();
            }
            else {
                // Just create a dummy translate area
                this.translateArea = new PIXI.DisplayObjectContainer();

                // Make the whole body the drag handle for rotation
                this.rotateArea = new PIXI.DisplayObjectContainer();
                this.rotateArea.buttonMode = true;
                this.rotateArea.defaultCursor = 'nesw-resize';
                this.rotateArea.hitArea = bodyArea;
                this.rotationFrame.addChild(this.rotateArea);
            }
        },

        initRotateHandle: function() {
            this.rotateArea = new PIXI.DisplayObjectContainer();
            this.rotateArea.buttonMode = true;
            this.rotateArea.defaultCursor = 'nesw-resize';
        },

        initButton: function() {
            this.button = new PIXI.DisplayObjectContainer();
            this.button.hitArea = new PIXI.Circle(-this.spriteWidth + this.spriteWidth * (99 / 150), 0, 10);
            this.button.buttonMode = true;
            this.rotationFrame.addChild(this.button);
        },

        drawTranslationArrows: function() {
            var xOrigin = Math.cos(this.rotationFrame.rotation) * -this.spriteWidth / 2;
            var yOrigin = Math.sin(this.rotationFrame.rotation) * -this.spriteWidth / 2;
            var length = this.spriteHeight * 2;
            var tw = this.arrowTailWidth;
            var hw = this.arrowHeadWidth;
            var hl = this.arrowHeadLength;

            this.translationArrows.clear();

            this.translationArrows.beginFill(this.arrowColor, 1);
            this.translationArrows.drawArrow(xOrigin, yOrigin, xOrigin, yOrigin + length, tw, hw, hl);
            this.translationArrows.endFill();

            this.translationArrows.beginFill(this.arrowColor, 1);
            this.translationArrows.drawArrow(xOrigin, yOrigin, xOrigin + length, yOrigin, tw, hw, hl);
            this.translationArrows.endFill();

            this.translationArrows.beginFill(this.arrowColor, 1);
            this.translationArrows.drawArrow(xOrigin, yOrigin, xOrigin, yOrigin - length, tw, hw, hl);
            this.translationArrows.endFill();

            this.translationArrows.beginFill(this.arrowColor, 1);
            this.translationArrows.drawArrow(xOrigin, yOrigin, xOrigin - length, yOrigin, tw, hw, hl);
            this.translationArrows.endFill();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // var targetCannonWidth = mvt.modelToViewDeltaX(this.model.get('width')); // In pixels
            // var scale = targetCannonWidth / this.cannon.width;

            // this.spritesLayer.scale.x = this.spritesLayer.scale.y = scale;

            this.update();
        },

        update: function() {
            this.updatePosition();
            this.updateAngle();
        },

        updateAngle: function() {
            this.rotationFrame.rotation = -this.model.getAngle() - Math.PI;
            this.drawTranslationArrows();
        },

        updatePosition: function() {
            var emissionPoint = this.mvt.modelToView(this.model.get('emissionPoint'));
            this.displayObject.x = emissionPoint.x;
            this.displayObject.y = emissionPoint.y;
        },

        onChanged: function(laser, on) {
            this.onSprite.visible = on;
            this.offSprite.visible = !on;
        },

        buttonClicked: function() {
            this.model.set('on', !this.model.get('on'));
        },

        dragTranslateAreaStart: function(data) {
            if (!this.rotateOnly) {
                this.draggingTranslateArea = true;    
            }
        },

        dragTranslateArea: function(data) {
            if (this.draggingTranslateArea) {
                var x = data.global.x - this.displayObject.x;
                var y = data.global.y - this.displayObject.y;
                
                
            }
        },

        dragTranslateAreaEnd: function(data) {
            this.draggingTranslateArea = false;
        },

        dragRotateAreaStart: function(data) {
            this.previousPedestalY = data.global.y;
            this.draggingRotateArea = true;
        },

        dragRotateArea: function(data) {
            if (this.draggingRotateArea) {
                var x = data.global.x - this.displayObject.x;
                var y = data.global.y - this.displayObject.y;
            }
        },

        dragRotateAreaEnd: function(data) {
            this.draggingRotateArea = false;
        },

        translateAreaHover: function() {
            this.translationArrows.visible = true;
        },

        translateAreaUnhover: function() {
            if (!this.draggingTranslateArea)
                this.translationArrows.visible = false;
        },

        rotateAreaHover: function() {
            this.rotationArrows.visible = true;
        },
        
        rotateAreaUnhover: function() {
            if (!this.draggingRotateArea)
                this.rotationArrows.visible = false;
        },

    });

    return LaserView;
});