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
            this.normalFillColor = this.fillColor;
            this.normalFillAlpha = this.fillAlpha;

            this._attributes = {};
            this._dragOffset = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._tipRelativeDragOffset = new PIXI.Point();

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

            this.setDraggingFill();

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
            this.setNormalFill();
            this.drawArrow();
        },

        dragHeadStart: function(data) {
            if (!this.bodyDraggingEnabled)
                return;

            this.setDraggingFill();

            var pointRelativeToObjectOrigin = data.getLocalPosition(this.displayObject, this._dragOffset);
            var pointRelativeToArrowTip = this._tipRelativeDragOffset;
            pointRelativeToArrowTip.x = pointRelativeToObjectOrigin.x + this.model.get('originX') - this.model.get('targetX');
            pointRelativeToArrowTip.y = pointRelativeToObjectOrigin.y + this.model.get('originY') - this.model.get('targetY');

            this.dragOffset = pointRelativeToArrowTip;
            this.draggingHead = true;
        },

        dragHead: function(data) {
            if (this.draggingHead) {
                var local = data.getLocalPosition(this.displayObject, this._dragLocation);
                var x = this.model.get('originX') + local.x - this.dragOffset.x;
                var y = this.model.get('originY') + local.y - this.dragOffset.y;
                
                delete this._attributes.originX;
                delete this._attributes.originY;
                this._attributes.targetX = x;
                this._attributes.targetY = y;

                this.model.set(this._attributes);
            }
        },

        dragHeadEnd: function(data) {
            this.draggingHead = false;
            this.setNormalFill();
            this.drawArrow();
        },

        setDraggingFill: function() {
            this.fillColor = this.dragFillColor;
            this.fillAlpha = this.dragFillAlpha;
        },

        setNormalFill: function() {
            this.fillColor = this.normalFillColor;
            this.fillAlpha = this.normalFillAlpha;
        }

    });

    return DraggableArrowView;
});
