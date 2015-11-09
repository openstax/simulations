define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var CompassNeedleTexture = require('views/compass-needle-texture');

    var Assets = require('assets');

    var Constants = require('constants');
    var RING_COLOR      = Colors.parseHex(Constants.CompassView.RING_COLOR);
    var LENS_COLOR      = Colors.parseHex(Constants.CompassView.LENS_COLOR);
    var INDICATOR_COLOR = Colors.parseHex(Constants.CompassView.INDICATOR_COLOR);
    var ANCHOR_COLOR    = Colors.parseHex(Constants.CompassView.ANCHOR_COLOR);

    /**
     * 
     */
    var CompassView = PixiView.extend({

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
         * Initializes the new CompassView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._vec = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:position',  this.updatePosition);
            this.listenTo(this.model, 'change:direction', this.updateDirection);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.needle = new PIXI.Sprite(CompassNeedleTexture.create(this.mvt.modelToViewDeltaX(CompassView.NEEDLE_WIDTH)));
            this.needle.anchor.x = this.needle.anchor.y = 0.5;
            
            this.graphics = new PIXI.Graphics();

            this.displayObject.addChild(this.needle);
            this.displayObject.addChild(this.graphics);
            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        drawCompass: function() {
            var graphics = this.graphics;
            var ringRadius      = Math.round(this.mvt.modelToViewDeltaX(CompassView.RING_DIAMETER - CompassView.RING_STROKE_WIDTH) / 2);
            var ringStrokeWidth = Math.round(this.mvt.modelToViewDeltaX(CompassView.RING_STROKE_WIDTH));
            var indicatorRadius = Math.round(this.mvt.modelToViewDeltaX(CompassView.INDICATOR_DIAMETER) / 2);
            var anchorRadius    = Math.round(this.mvt.modelToViewDeltaX(CompassView.ANCHOR_DIAMETER) / 2);

            graphics.lineStyle(ringStrokeWidth, RING_COLOR, 1);
            graphics.arc(0, 0, ringRadius, 0, Math.PI * 2.1);
            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;

            graphics.lineStyle(0, 0, 0);
            graphics.beginFill(INDICATOR_COLOR, 1);
            var vec = this._vec;
            var angle = 0; // Radians
            while (angle < Math.PI * 2) {
                vec.set(0, ringRadius).rotate(angle);
                var rx = vec.x;
                var ry = vec.y;
                graphics.drawCircle(vec.x, vec.y, indicatorRadius);
                angle += CompassView.INDICATOR_INCREMENT;
            }
            graphics.endFill();

            graphics.beginFill(ANCHOR_COLOR, 1);
            graphics.drawCircle(0, 0, anchorRadius);
            graphics.endFill();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawCompass();

            this.needle.texture = CompassNeedleTexture.create(this.mvt.modelToViewDeltaX(CompassView.NEEDLE_WIDTH));

            this.displayObject.hitArea = new PIXI.Circle(0, 0, this.mvt.modelToViewDeltaX(CompassView.RING_DIAMETER) / 2);

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        updateDirection: function(model, direction) {
            this.needle.rotation = direction;
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var local = event.data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                var x = local.x - this.dragOffset.x;
                var y = local.y - this.dragOffset.y;
                
                var mx = this.mvt.viewToModelX(x);
                var my = this.mvt.viewToModelY(y);

                this.model.setPosition(mx, my);
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

    }, Constants.CompassView);


    return CompassView;
});