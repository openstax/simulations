define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var defineInputUpdateLocks = require('common/locks/define-locks');
    var Colors                 = require('common/colors/colors');
    
    var ObjectView = require('views/object');

    var Constants = require('constants');
    var Types = Constants.SourceObject.Types;
    var SECOND_POINT_COLOR = Colors.parseHex(Constants.SourceObjectView.SECOND_POINT_COLOR);


    /**
     * Represents a SourceObject model.  This can be rendered as
     *   either a solid object or a lamp (or a pair of lamps if
     *   the second point is enabled).  The user can drag the
     *   object and its second point around (or its two lamps
     *   independently).
     */
    var SourceObjectView = ObjectView.extend({

        events: {
            'touchstart      .pictureContainer': 'dragStart',
            'mousedown       .pictureContainer': 'dragStart',
            'touchmove       .pictureContainer': 'drag',
            'mousemove       .pictureContainer': 'drag',
            'touchend        .pictureContainer': 'dragEnd',
            'mouseup         .pictureContainer': 'dragEnd',
            'touchendoutside .pictureContainer': 'dragEnd',
            'mouseupoutside  .pictureContainer': 'dragEnd',

            'touchstart      .secondPoint': 'dragSecondPointStart',
            'mousedown       .secondPoint': 'dragSecondPointStart',
            'touchmove       .secondPoint': 'dragSecondPoint',
            'mousemove       .secondPoint': 'dragSecondPoint',
            'touchend        .secondPoint': 'dragSecondPointEnd',
            'mouseup         .secondPoint': 'dragSecondPointEnd',
            'touchendoutside .secondPoint': 'dragSecondPointEnd',
            'mouseupoutside  .secondPoint': 'dragSecondPointEnd'
        },

        /**
         * Initializes the new ObjectView.
         */
        initialize: function(options) {
            ObjectView.prototype.initialize.apply(this, arguments);

            this._dragOffset = new PIXI.Point();

            this.listenTo(this.model, 'change:scale',       this.updateScale);
            this.listenTo(this.model, 'change:strength',    this.updateStrength);
            this.listenTo(this.model, 'change:secondPoint', this.updateSecondPoint);

            this.updateSecondPoint(this.model, this.model.get('secondPoint'));
        },

        initGraphics: function() {
            ObjectView.prototype.initGraphics.apply(this, arguments);
    
            var secondPointMarker = new PIXI.Graphics();
            secondPointMarker.lineStyle(1, 0xFFFFFF, 1);
            secondPointMarker.beginFill(SECOND_POINT_COLOR, SourceObjectView.SECOND_POINT_ALPHA);
            secondPointMarker.drawCircle(0, 0, SourceObjectView.SECOND_POINT_SIZE  / 2);
            secondPointMarker.endFill();

            this.secondPoint = new PIXI.DisplayObjectContainer();
            this.secondPoint.addChild(secondPointMarker);
            this.secondPoint.visible = false;
            this.displayObject.addChild(this.secondPoint);
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.pictureContainer, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.pictureContainer.x - this.dragOffset.x;
                var dy = data.global.y - this.pictureContainer.y - this.dragOffset.y;
                
                this.pictureContainer.x += dx;
                this.pictureContainer.y += dy;

                this.secondPoint.x += dx;
                this.secondPoint.y += dy;

                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.inputLock(function() {
                    this.model.translate(mdx, mdy);
                    this.model.translateSecondPoint(mdx, mdy);
                });
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        dragSecondPointStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.secondPoint, this._dragOffset);
            this.draggingSecondPoint = true;
        },

        dragSecondPoint: function(data) {
            if (this.draggingSecondPoint) {
                var dx = data.global.x - this.secondPoint.x - this.dragOffset.x;
                var dy = data.global.y - this.secondPoint.y - this.dragOffset.y;
                
                if (this.model.get('type') !== Types.LIGHT) {
                    // If we're not in lamp mode, we need to constrain movement
                    dx = 0;

                    var newY = this.secondPoint.y + dy;
                    var ySpan = Math.abs(this.mvt.modelToViewDeltaY(ObjectView.SECOND_POINT_Y_SPAN_IN_METERS));

                    if (newY < this.pictureContainer.y)
                        dy = this.pictureContainer.y - this.secondPoint.y;
                    else if (newY > this.pictureContainer.y + ySpan)
                        dy = (this.pictureContainer.y + ySpan) - this.secondPoint.y;
                }

                this.secondPoint.x += dx;
                this.secondPoint.y += dy;

                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.inputLock(function() {
                    this.model.translateSecondPoint(mdx, mdy);
                });
            }
        },

        dragSecondPointEnd: function(data) {
            this.draggingSecondPoint = false;
        },

        updatePosition: function(model, position) {
            this.updateLock(function() {
                var viewPosition = this.mvt.modelToView(position);
                this.pictureContainer.x = viewPosition.x;
                this.pictureContainer.y = viewPosition.y;
            });
        },

        updateSecondPoint: function(model, secondPoint) {
            this.updateLock(function() {
                var viewPosition = this.mvt.modelToView(secondPoint);
                this.secondPoint.x = viewPosition.x;
                this.secondPoint.y = viewPosition.y;
            });
        },

        showSecondPoint: function() {
            this.secondPoint.visible = true;
        },

        hideSecondPoint: function() {
            this.secondPoint.visible = false;
        }

    }, Constants.SourceObjectView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(SourceObjectView);


    return SourceObjectView;
});