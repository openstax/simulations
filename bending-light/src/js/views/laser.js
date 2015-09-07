define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
                   require('common/v3/pixi/draw-arrow');
    var Colors   = require('common/colors/colors');
    var range    = require('common/math/range');
    var Vector2  = require('common/math/vector2');

    var RotationHandle = require('views/rotation-handle');

    var Assets = require('assets');

    var Constants = require('constants');
    var RADIANS_TO_DEGREES = 180 / Math.PI;

    /**
     * A view that represents the laser and can be moved and rotated
     *   by the user to change the laser beam's direction and origin.
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
            this.clampAngleFunction = options.clampAngleFunction;

            this.arrowTailWidth = 12;
            this.arrowHeadWidth = 24;
            this.arrowHeadLength = 20;
            this.arrowColor = 0x81E4AA;

            this.initGraphics();

            // Cached objects
            this._vec = new Vector2();
            this._dragOffset = new PIXI.Point();

            this.listenTo(this.model, 'change:on', this.onChanged);
            this.listenTo(this.model, 'change:emissionPoint', this.update);
        },

        initGraphics: function() {
            this.rotationFrame = new PIXI.Container();

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
                this.translateArea = new PIXI.Container();
                this.translateArea.hitArea = bodyArea;
                this.translateArea.buttonMode = true;
                this.translateArea.defaultCursor = 'move';
                this.rotationFrame.addChild(this.translateArea);

                // Create a special rotation handle off the back end
                this.initRotateHandle();
            }
            else {
                // Just create a dummy translate area
                this.translateArea = new PIXI.Container();

                // Make the whole body the drag handle for rotation
                this.rotateArea = new PIXI.Container();
                this.rotateArea.buttonMode = true;
                this.rotateArea.defaultCursor = 'nesw-resize';
                this.rotateArea.hitArea = bodyArea;
                this.rotationFrame.addChild(this.rotateArea);
            }
        },

        initRotateHandle: function() {
            this.rotateArea = new PIXI.Container();
            this.rotateArea.buttonMode = true;
            this.rotateArea.defaultCursor = 'nesw-resize';

            var rotationHandleView = new RotationHandle();
            rotationHandleView.displayObject.x = -this.spriteWidth;
            rotationHandleView.displayObject.rotation = Math.PI;
            this.rotateArea.addChild(rotationHandleView.displayObject);

            this.rotationFrame.addChild(this.rotateArea);
        },

        initButton: function() {
            this.button = new PIXI.Container();
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

        dragTranslateAreaStart: function(event) {
            if (!this.rotateOnly) {
                this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
                this.draggingTranslateArea = true;    
            }
        },

        dragTranslateArea: function(event) {
            if (this.draggingTranslateArea) {
                var dx = event.data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = event.data.global.y - this.displayObject.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translate(mdx, mdy);
            }
        },

        dragTranslateAreaEnd: function(event) {
            this.draggingTranslateArea = false;
            if (!this.translateAreaHovering)
                this.translateAreaUnhover();
        },

        dragRotateAreaStart: function(event) {
            this.draggingRotateArea = true;
        },

        dragRotateArea: function(event) {
            if (this.draggingRotateArea) {
                var x = event.data.global.x;
                var y = event.data.global.y;

                var mx = this.mvt.viewToModelX(x);
                var my = this.mvt.viewToModelY(y);
                var vector = this._vec.set(mx, my).sub(this.model.get('pivotPoint'));

                if (this.clampAngleFunction)
                    this.model.setAngle(this.clampAngleFunction(vector.angle()));
                else
                    this.model.setAngle(vector.angle());
            }
        },

        dragRotateAreaEnd: function(event) {
            this.draggingRotateArea = false;
            if (!this.rotateAreaHovering)
                this.rotateAreaUnhover();
        },

        translateAreaHover: function() {
            if (!this.draggingRotateArea) {
                this.translateAreaHovering = true;
                this.translationArrows.visible = true;    
            }
        },

        translateAreaUnhover: function() {
            this.translateAreaHovering = false;
            if (!this.draggingTranslateArea)
                this.translationArrows.visible = false;
        },

        rotateAreaHover: function() {
            if (!this.draggingTranslateArea) {
                this.rotateAreaHovering = true;
                this.rotationArrows.visible = true;
            }
        },
        
        rotateAreaUnhover: function() {
            this.rotateAreaHovering = false;
            if (!this.draggingRotateArea)
                this.rotationArrows.visible = false;
        },

    });

    return LaserView;
});