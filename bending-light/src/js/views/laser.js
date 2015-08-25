define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    var range    = require('common/math/range');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');
    var RADIANS_TO_DEGREES = 180 / Math.PI;

    /**
     * A view that represents a cannon model
     */
    var CannonView = PixiView.extend({

        events: {
            'touchstart      .translateArea': 'dragTranslateAreaStart',
            'mousedown       .translateArea': 'dragTranslateAreaStart',
            'touchmove       .translateArea': 'dragTranslateArea',
            'mousemove       .translateArea': 'dragTranslateArea',
            'touchend        .translateArea': 'dragTranslateAreaEnd',
            'mouseup         .translateArea': 'dragTranslateAreaEnd',
            'touchendoutside .translateArea': 'dragTranslateAreaEnd',
            'mouseupoutside  .translateArea': 'dragTranslateAreaEnd',

            'touchstart      .rotateArea': 'dragRotateAreaStart',
            'mousedown       .rotateArea': 'dragRotateAreaStart',
            'touchmove       .rotateArea': 'dragRotateArea',
            'mousemove       .rotateArea': 'dragRotateArea',
            'touchend        .rotateArea': 'dragRotateAreaEnd',
            'mouseup         .rotateArea': 'dragRotateAreaEnd',
            'touchendoutside .rotateArea': 'dragRotateAreaEnd',
            'mouseupoutside  .rotateArea': 'dragRotateAreaEnd',

            'click .button': 'buttonClicked'
        },

        /**
         *
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.time = 0;

            this.initGraphics();

            this._initialPosition = new Vector2();

            // Listen to angle because the user can change that from the control panel,
            //   but don't listen to x or y because those will only ever be changed
            //   through this view.
            // this.listenTo(this.model, 'change:angle', this.updateAngle);
            // this.updateAngle(this.model, this.model.get('angle'));

            this.listenTo(this.model, 'change:on', this.onChanged);
            this.listenTo(this.model, 'change:emissionPoint', this.updatePosition);
        },

        initGraphics: function() {
            this.initSprites();
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

            this.displayObject.addChild(this.onSprite);
            this.displayObject.addChild(this.offSprite);
        },

        initDragAreas: function() {
            this.translateArea = new PIXI.DisplayObjectContainer();
            this.translateArea.hitArea = new PIXI.Rectangle(-this.spriteWidth, -this.spriteHeight / 2, this.spriteWidth, this.spriteHeight);
            this.translateArea.buttonMode = true;
            this.translateArea.defaultCursor = 'move';
            this.displayObject.addChild(this.translateArea);

            this.rotateArea = new PIXI.DisplayObjectContainer();
            this.rotateArea.hitArea = new PIXI.Rectangle(-this.spriteWidth * 1.5, -this.spriteHeight / 2, this.spriteWidth / 2, this.spriteHeight);
            this.rotateArea.buttonMode = true;
            this.displayObject.addChild(this.rotateArea);
        },

        initButton: function() {
            this.button = new PIXI.DisplayObjectContainer();
            this.button.hitArea = new PIXI.Circle(-this.spriteWidth + this.spriteWidth * (99 / 150), 0, 10);
            this.button.buttonMode = true;
            this.displayObject.addChild(this.button);
        },

        updateAngle: function(cannon, angleInDegrees) {
            this.spritesLayer.rotation = this.model.firingAngle();
        },

        updatePosition: function() {
            var emissionPoint = this.mvt.modelToView(this.model.get('emissionPoint'));
            this.displayObject.x = emissionPoint.x;
            this.displayObject.y = emissionPoint.y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // var targetCannonWidth = mvt.modelToViewDeltaX(this.model.get('width')); // In pixels
            // var scale = targetCannonWidth / this.cannon.width;

            // this.spritesLayer.scale.x = this.spritesLayer.scale.y = scale;

            this.updatePosition();
        },

        update: function(time, deltaTime, paused) {

        },

        onChanged: function(laser, on) {
            this.onSprite.visible = on;
            this.offSprite.visible = !on;
        },

        buttonClicked: function() {
            this.model.set('on', !this.model.get('on'));
        },

        dragTranslateAreaStart: function(data) {
            this.draggingCannon = true;
        },

        dragTranslateArea: function(data) {
            if (this.draggingCannon) {
                var x = data.global.x - this.displayObject.x;
                var y = data.global.y - this.displayObject.y;
                
                var angle = Math.atan2(y, x);
                var degrees = -angle * RADIANS_TO_DEGREES;
                // Catch the case where we go into negatives at the 180deg mark
                if (degrees >= -180 && degrees < Constants.Cannon.MIN_ANGLE && this.model.get('angle') > 0)
                    degrees = 360 + degrees;

                // Make sure it's within bounds
                if (degrees < Constants.Cannon.MIN_ANGLE)
                    degrees = Constants.Cannon.MIN_ANGLE;
                if (degrees > Constants.Cannon.MAX_ANGLE)
                    degrees = Constants.Cannon.MAX_ANGLE;
                this.model.set('angle', degrees);
            }
        },

        dragTranslateAreaEnd: function(data) {
            this.draggingCannon = false;
        },

        dragRotateAreaStart: function(data) {
            this.previousPedestalY = data.global.y;
            this.draggingPedestal = true;
        },

        dragRotateArea: function(data) {
            if (this.draggingPedestal) {
                var dy = data.global.y - this.previousPedestalY;
                this.previousPedestalY = data.global.y;

                dy = this.mvt.viewToModelDeltaY(dy);

                var y = this.model.get('y') + dy;
                if (y < 0)
                    y = 0;
                this.model.set('y', y);

                this.updatePosition();
                this.drawPedestal();
                this.drawAxes();
            }
        },

        dragRotateAreaEnd: function(data) {
            this.draggingPedestal = false;
        },


    }, Constants.CannonView);

    return CannonView;
});