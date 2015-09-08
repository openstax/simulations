define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var RotationHandle = require('views/rotation-handle');

    var Polygon           = require('models/shape/polygon');
    var Circle            = require('models/shape/circle');
    var ShapeIntersection = require('models/shape/shape-intersection');
    var ShapeDifference   = require('models/shape/shape-difference');

    var Constants = require('constants');

    /**
     * 
     */
    var PrismView = PixiView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',

            'touchstart      .rotationHandle': 'dragRotationHandleStart',
            'mousedown       .rotationHandle': 'dragRotationHandleStart',
            'touchmove       .rotationHandle': 'dragRotationHandle',
            'mousemove       .rotationHandle': 'dragRotationHandle',
            'touchend        .rotationHandle': 'dragRotationHandleEnd',
            'mouseup         .rotationHandle': 'dragRotationHandleEnd',
            'touchendoutside .rotationHandle': 'dragRotationHandleEnd',
            'mouseupoutside  .rotationHandle': 'dragRotationHandleEnd'
        },

        /**
         *
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.medium = options.medium;

            this.initGraphics();

            // Cached objects
            this._vec = new Vector2();
            this._dragOffset = new PIXI.Point();

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:rotation', this.updateRotation);
            this.listenTo(this.medium, 'change:color',   this.draw);
        },

        initGraphics: function() {
            this.initPrism();
            this.initRotationHandle();

            this.updateMVT(this.mvt);
        },

        initPrism: function() {
            this.graphics = new PIXI.Graphics();
            this.displayObject.addChild(this.graphics);
        },

        initRotationHandle: function() {
            var rotationHandleView = new RotationHandle();
            rotationHandleView.displayObject.x = -this.spriteWidth;
            rotationHandleView.displayObject.rotation = Math.PI;
            this.rotationHandle = rotationHandleView.displayObject
            this.rotationHandle.buttonMode = true;

            this.displayObject.addChild(this.rotationHandle);
        },

        draw: function() {
            var shape = this.model.shape;
            var graphics = this.graphics;

            // We need to set the graphics object's rotation back by the current
            //   rotation in case the shape itself has been rotated, because we
            //   apply all the rotations to the displayObject instead of drawing
            //   the actual state of the shape.
            graphics.rotation = this.model.get('rotation');

            var colorRgba = this.medium.get('color');
            var color = Colors.rgbToHexInteger(colorRgba);
            var outlineColor = Colors.rgbToHexInteger(Colors.darkenRgba(colorRgba, 0.2));
            graphics.lineStyle(1, outlineColor, 1);
            graphics.beginFill(color, 1);

            if (shape instanceof Circle) {
                graphics.drawCircle(0, 0, this.mvt.modelToViewDeltaX(shape.radius));
            }
            else
                graphics.drawRect(0, 0, 100, 100);

            graphics.endFill();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updatePosition();
            this.updateRotation();
            this.draw();
        },

        updateRotation: function() {
            this.displayObject.rotation = -this.model.get('rotation');
        },

        updatePosition: function() {
            var viewPosition = this.mvt.modelToView(this.model.get('position'));
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        dragStart: function(event) {
            if (!this.rotateOnly) {
                this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
                this.translating = true;    
            }
        },

        drag: function(event) {
            if (this.translating) {
                var dx = event.data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = event.data.global.y - this.displayObject.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translate(mdx, mdy);
            }
        },

        dragEnd: function(event) {
            this.translating = false;
        },

        dragRotationHandleStart: function(event) {
            this.rotating = true;
        },

        dragRotationHandle: function(event) {
            if (this.rotating) {
                var x = event.data.global.x;
                var y = event.data.global.y;

                var vector = this._vec.set(x, y).sub(this.displayObject.x, this.displayObject.y);
                var rotation = vector.angle();
                var dr = rotation - this.model.get('rotation');
                
                this.model.rotate(dr);
            }
        },

        dragRotationHandleEnd: function(event) {
            this.rotating = false;
        }

    });

    return PrismView;
});