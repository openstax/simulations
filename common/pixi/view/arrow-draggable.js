define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    var ArrowView = require('./arrow');

    var Colors  = require('../../colors/colors');
    var Vector2 = require('../../math/vector2');

    var DraggableArrowView = ArrowView.extend({

        events: {
            'touchstart      .tailGraphics': 'dragBodyStart',
            'mousedown       .tailGraphics': 'dragBodyStart',
            'touchmove       .tailGraphics': 'dragBody',
            'mousemove       .tailGraphics': 'dragBody',
            'touchend        .tailGraphics': 'dragBodyEnd',
            'mouseup         .tailGraphics': 'dragBodyEnd',
            'touchendoutside .tailGraphics': 'dragBodyEnd',
            'mouseupoutside  .tailGraphics': 'dragBodyEnd',

            'touchstart      .headGraphics': 'dragHeadStart',
            'mousedown       .headGraphics': 'dragHeadStart',
            'touchmove       .headGraphics': 'dragHead',
            'mousemove       .headGraphics': 'dragHead',
            'touchend        .headGraphics': 'dragHeadEnd',
            'mouseup         .headGraphics': 'dragHeadEnd',
            'touchendoutside .headGraphics': 'dragHeadEnd',
            'mouseupoutside  .headGraphics': 'dragHeadEnd'
        },

        initialize: function(options) {
            options = _.extend({
                dragFillColor: undefined,
                dragFillAlpha: undefined,

                bodyDraggingEnabled: true,
                headDraggingEnabled: true
            }, options);

            ArrowView.prototype.initialize.apply(this, [options]);

            this.bodyDraggingEnabled = options.bodyDraggingEnabled;
            this.headDraggingEnabled = options.headDraggingEnabled;

            this.dragFillColor = options.dragFillColor !== undefined ? Colors.parseHex(options.dragFillColor) : this.fillColor;
            this.dragFillAlpha = options.dragFillAlpha !== undefined ? options.dragFillAlpha : this.fillAlpha;

            this._attributes = {};
            this._dragOffset = new PIXI.Point();
            this._dragLocation = new PIXI.Point();

            // Has to be done after the graphics get drawn once
            if (this.bodyDraggingEnabled)
                this.tailGraphics.buttonMode = true;
            if (this.headDraggingEnabled)
                this.headGraphics.buttonMode = true;

            this.tailGraphics.defaultCursor = 'move';
            this.headGraphics.defaultCursor = 'pointer';
        },

        initGraphics: function() {
            ArrowView.prototype.initGraphics.apply(this);

        },

        dragBodyStart: function(data) {
            if (!this.bodyDraggingEnabled)
                return;

            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.draggingBody = true;
        },

        dragBody: function(data) {
            if (this.draggingBody) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                var dx = local.x - this.displayObject.x - this.dragOffset.x;
                var dy = local.y - this.displayObject.y - this.dragOffset.y;
                
                this._attributes.originX = this.model.get('originX') + dx;
                this._attributes.originY = this.model.get('originY') + dy;
                this._attributes.targetX = this.model.get('targetX') + dx;
                this._attributes.targetY = this.model.get('targetY') + dy;

                this.model.set(this._attributes);
            }
        },

        dragBodyEnd: function(data) {
            this.draggingBody = false;
        },

        dragHeadStart: function(data) {
            if (!this.bodyDraggingEnabled)
                return;

            this.lastPoint = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.draggingHead = true;
        },

        dragHead: function(data) {
            if (this.draggingHead) {
                var local = data.getLocalPosition(this.displayObject, this._dragLocation);
                var dx = local.x - this.lastPoint.x;
                var dy = local.y - this.lastPoint.y;
                
                this.lastPoint.x = local.x;
                this.lastPoint.y = local.y;
                
                delete this._attributes.originX;
                delete this._attributes.originY;
                this._attributes.targetX = this.model.get('targetX') + dx;
                this._attributes.targetY = this.model.get('targetY') + dy;

                this.model.set(this._attributes);
            }
        },

        dragHeadEnd: function(data) {
            this.draggingHead = false;
        },

    });

    return DraggableArrowView;
});
