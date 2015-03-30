define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    var ArrowView = require('./arrow');

    var Colors  = require('../../colors/colors');
    var Vector2 = require('../../math/vector2');

    // Default snapping function just snaps to nearest 10 pixels
    var defaultSnappingFunction = function(coordinateComponent) {
        return Math.round(coordinateComponent / 10) * 10;
    };


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
            'mouseupoutside  .headGraphics': 'dragHeadEnd',

            'touchstart      .smallDot': 'dragHeadStart',
            'mousedown       .smallDot': 'dragHeadStart',
            'touchmove       .smallDot': 'dragHead',
            'mousemove       .smallDot': 'dragHead',
            'touchend        .smallDot': 'dragHeadEnd',
            'mouseup         .smallDot': 'dragHeadEnd',
            'touchendoutside .smallDot': 'dragHeadEnd',
            'mouseupoutside  .smallDot': 'dragHeadEnd'
        },

        initialize: function(options) {
            options = _.extend({
                dragFillColor: undefined,
                dragFillAlpha: undefined,

                bodyDraggingEnabled: true,
                headDraggingEnabled: true,

                snappingEnabled: false,
                snappingXFunction: defaultSnappingFunction,
                snappingYFunction: defaultSnappingFunction,

                useDotWhenSmall: false
            }, options);

            ArrowView.prototype.initialize.apply(this, [options]);

            this.bodyDraggingEnabled = options.bodyDraggingEnabled;
            this.headDraggingEnabled = options.headDraggingEnabled;

            this.dragFillColor = options.dragFillColor !== undefined ? Colors.parseHex(options.dragFillColor) : this.fillColor;
            this.dragFillAlpha = options.dragFillAlpha !== undefined ? options.dragFillAlpha : this.fillAlpha;
            this.normalFillColor = this.fillColor;
            this.normalFillAlpha = this.fillAlpha;

            this.snappingEnabled = options.snappingEnabled;
            this.snappingXFunction = options.snappingXFunction;
            this.snappingYFunction = options.snappingYFunction;

            this.useDotWhenSmall = options.useDotWhenSmall;
            this.initSmallDot();

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

        initSmallDot: function() {
            this.smallDot = new PIXI.Graphics();
            this.smallDot.beginFill(this.fillColor, this.fillAlpha * 0.5);
            this.smallDot.drawCircle(0, 0, this.headLength / 2);
            this.smallDot.endFill();
            this.smallDot.visible = false;

            this.displayObject.addChild(this.smallDot);

            this.listenTo(this.model, 'change', this.modelChanged);
        },

        dragBodyStart: function(data) {
            if (!this.bodyDraggingEnabled)
                return;

            this.setDraggingFill();

            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.draggingBody = true;

            this.trigger('drag-body-start');
        },

        dragBody: function(data) {
            if (this.draggingBody) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                var dx = local.x - this.displayObject.x - this.dragOffset.x;
                var dy = local.y - this.displayObject.y - this.dragOffset.y;

                if (this.snappingEnabled) {
                    this._attributes.originX = this.snappingXFunction(this.model.get('originX') + dx);
                    this._attributes.originY = this.snappingYFunction(this.model.get('originY') + dy);
                    this._attributes.targetX = this.snappingXFunction(this.model.get('targetX') + dx);
                    this._attributes.targetY = this.snappingYFunction(this.model.get('targetY') + dy);
                }
                else {
                    this._attributes.originX = this.model.get('originX') + dx;
                    this._attributes.originY = this.model.get('originY') + dy;
                    this._attributes.targetX = this.model.get('targetX') + dx;
                    this._attributes.targetY = this.model.get('targetY') + dy;
                }

                this.model.set(this._attributes);
            }
        },

        dragBodyEnd: function(data) {
            this.draggingBody = false;
            this.setNormalFill();
            this.drawArrow();
            this.trigger('drag-body-end');
        },

        dragHeadStart: function(data) {
            if (!this.headDraggingEnabled)
                return;

            this.setDraggingFill();

            var pointRelativeToObjectOrigin = data.getLocalPosition(this.displayObject, this._dragOffset);
            var pointRelativeToArrowTip = this._tipRelativeDragOffset;
            pointRelativeToArrowTip.x = pointRelativeToObjectOrigin.x + this.model.get('originX') - this.model.get('targetX');
            pointRelativeToArrowTip.y = pointRelativeToObjectOrigin.y + this.model.get('originY') - this.model.get('targetY');

            this.dragOffset = pointRelativeToArrowTip;
            this.draggingHead = true;

            this.trigger('drag-head-start');
        },

        dragHead: function(data) {
            if (this.draggingHead) {
                var local = data.getLocalPosition(this.displayObject, this._dragLocation);
                var x = this.model.get('originX') + local.x - this.dragOffset.x;
                var y = this.model.get('originY') + local.y - this.dragOffset.y;

                delete this._attributes.originX;
                delete this._attributes.originY;
                if (this.snappingEnabled) {
                    this._attributes.targetX = this.snappingXFunction(x);
                    this._attributes.targetY = this.snappingYFunction(y);
                }
                else {
                    this._attributes.targetX = x;
                    this._attributes.targetY = y;
                }

                // Constrain with min and max lengths
                var origin = this._originVector.set(this.model.get('originX'), this.model.get('originY'));
                var target = this._targetVector.set(this._attributes.targetX, this._attributes.targetY);
                var length = origin.distance(target);

                if ((this.model.get('minLength') === null || this.model.get('minLength') === undefined || length >= this.model.get('minLength')) &&
                    (this.model.get('maxLength') === null || this.model.get('maxLength') === undefined || length <= this.model.get('maxLength'))
                ) {
                    this.model.set(this._attributes);
                }
                else if (!this.snappingEnabled) {
                    // We will need to scale our desired target offset
                    var direction = this._direction.set(target).sub(origin);

                    var targetLength;
                    if (this.model.get('minLength') !== null && this.model.get('minLength') !== undefined && length < this.model.get('minLength'))
                        targetLength = this.model.get('minLength');
                    else if (this.model.get('maxLength') !== null && this.model.get('maxLength') !== undefined && length > this.model.get('maxLength'))
                        targetLength = this.model.get('maxLength');

                    direction.normalize().scale(targetLength);

                    this._attributes.targetX = this.model.get('originX') + direction.x;
                    this._attributes.targetY = this.model.get('originY') + direction.y;
                    this.model.set(this._attributes);
                }
            }
        },

        dragHeadEnd: function(data) {
            this.draggingHead = false;
            this.setNormalFill();
            this.drawArrow();

            if (this.useDotWhenSmall && this.smallDotEnabled) {
                this.smallDot.visible = true;
            }

            this.trigger('drag-head-end');
        },

        setDraggingFill: function() {
            this.fillColor = this.dragFillColor;
            this.fillAlpha = this.dragFillAlpha;
        },

        setNormalFill: function() {
            this.fillColor = this.normalFillColor;
            this.fillAlpha = this.normalFillAlpha;
        },

        modelChanged: function() {
            var origin = this._originVector.set(this.model.get('originX'), this.model.get('originY'));
            var target = this._targetVector.set(this.model.get('targetX'), this.model.get('targetY'));
            var length = origin.distance(target);

            if (this.useDotWhenSmall && length < this.headLength) {
                this.smallDot.x = target.x - origin.x;
                this.smallDot.y = target.y - origin.y;

                this.smallDot.visible = true;
            }
            else {
                this.smallDot.visible = false;
            }
        }

    });

    return DraggableArrowView;
});
