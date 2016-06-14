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

    var Assets = require('assets');

    /**
     * Represents a SourceObject model.  This can be rendered as
     *   either a solid object or a lamp (or a pair of lamps if
     *   the second point is enabled).  The user can drag the
     *   object and its second point around (or its two lamps
     *   independently).
     */
    var SourceObjectView = ObjectView.extend({

        events: {
            'touchstart      .objectContainer': 'dragStart',
            'mousedown       .objectContainer': 'dragStart',
            'touchmove       .objectContainer': 'drag',
            'mousemove       .objectContainer': 'drag',
            'touchend        .objectContainer': 'dragEnd',
            'mouseup         .objectContainer': 'dragEnd',
            'touchendoutside .objectContainer': 'dragEnd',
            'mouseupoutside  .objectContainer': 'dragEnd',

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

            this.secondPoint = new PIXI.Container();
            this.secondPoint.addChild(secondPointMarker);
            this.secondPoint.visible = false;
            this.displayObject.addChild(this.secondPoint);

            this.objectContainer.buttonMode = true;
            this.secondPoint.buttonMode = true;

            this.initLamps();
        },

        initLamps: function() {
            this.lamp1 = Assets.createSprite(Assets.Images.LAMP_BLUE);
            this.lamp2 = Assets.createSprite(Assets.Images.LAMP_RED);

            this.lamp1.anchor.x = this.lamp2.anchor.x = 0.62;
            this.lamp1.anchor.y = this.lamp2.anchor.y = 0.30;

            this.objectContainer.addChild(this.lamp1);
            this.secondPoint.addChild(this.lamp2);
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.objectContainer, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this.objectContainer.x - this.dragOffset.x;
                var dy = event.data.global.y - this.objectContainer.y - this.dragOffset.y;
                
                this.objectContainer.x += dx;
                this.objectContainer.y += dy;

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

        dragEnd: function(event) {
            this.dragging = false;
        },

        dragSecondPointStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.secondPoint, this._dragOffset);
            this.draggingSecondPoint = true;
        },

        dragSecondPoint: function(event) {
            if (this.draggingSecondPoint) {
                var dx = event.data.global.x - this.secondPoint.x - this.dragOffset.x;
                var dy = event.data.global.y - this.secondPoint.y - this.dragOffset.y;
                
                if (this.model.get('type') !== Types.LIGHT) {
                    // If we're not in lamp mode, we need to constrain movement
                    dx = 0;

                    var newY = this.secondPoint.y + dy;
                    var ySpan = Math.abs(this.mvt.modelToViewDeltaY(ObjectView.SECOND_POINT_Y_SPAN_IN_METERS));

                    if (newY < this.objectContainer.y)
                        dy = this.objectContainer.y - this.secondPoint.y;
                    else if (newY > this.objectContainer.y + ySpan)
                        dy = (this.objectContainer.y + ySpan) - this.secondPoint.y;
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

        dragSecondPointEnd: function(event) {
            this.draggingSecondPoint = false;
        },

        updatePosition: function(model, position) {
            this.updateLock(function() {
                var viewPosition = this.mvt.modelToView(position);
                this.objectContainer.x = viewPosition.x;
                this.objectContainer.y = viewPosition.y;
            });
        },

        updateSecondPoint: function(model, secondPoint) {
            this.updateLock(function() {
                var viewPosition = this.mvt.modelToView(secondPoint);
                this.secondPoint.x = viewPosition.x;
                this.secondPoint.y = viewPosition.y;
            });
        },

        updateType: function(object, type) {
            ObjectView.prototype.updateType.apply(this, arguments);

            this.pictureContainer.visible = (type !== Types.LIGHT);
            this.lamp1.visible = (type === Types.LIGHT);
            this.lamp2.visible = (type === Types.LIGHT);
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