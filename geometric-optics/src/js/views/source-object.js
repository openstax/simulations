define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var defineInputUpdateLocks = require('common/locks/define-locks');
    
    var ObjectView = require('views/object');

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

            this.listenTo(this.model, 'change:scale',    this.updateScale);
            this.listenTo(this.model, 'change:strength', this.updateStrength);
        },

        initGraphics: function() {
            ObjectView.prototype.initGraphics.apply(this, arguments);


            var secondPointMarker = new PIXI.Graphics();
            secondPointMarker.beginFill(0xFF0000, 1);
            secondPointMarker.drawCircle(0, 0, 8);
            secondPointMarker.endFill();

            this.secondPoint = new PIXI.DisplayObjectContainer();
            this.secondPoint.addChild(secondPointMarker);
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

        updatePosition: function(model, position) {
            this.updateLock(function() {
                var viewPosition = this.mvt.modelToView(position);
                this.pictureContainer.x = viewPosition.x;
                this.pictureContainer.y = viewPosition.y;
            });
        },

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(SourceObjectView);


    return SourceObjectView;
});