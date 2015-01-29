define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * Convert ring colors to hex and expand into an array
     *   where each ring gets its own entry in the array
     *   for simplicity during rendering.  Note that this
     *   should also work if there are more colors than
     *   rings.
     */
    var hexColors = _.map(Constants.TargetView.RING_COLORS, function(color) {
        return Colors.parseHex(color);
    });
    var RING_COLORS = [];
    for (var i = 0; i < Constants.TargetView.NUM_RINGS; i++)
        RING_COLORS.push(hexColors[i % hexColors.length]);

    /**
     * A view that represents a movable target model
     */
    var TargetView = PixiView.extend({

        events: {
            'touchstart      .graphics': 'dragStart',
            'mousedown       .graphics': 'dragStart',
            'touchmove       .graphics': 'drag',
            'mousemove       .graphics': 'drag',
            'touchend        .graphics': 'dragEnd',
            'mouseup         .graphics': 'dragEnd',
            'touchendoutside .graphics': 'dragEnd',
            'mouseupoutside  .graphics': 'dragEnd'
        },

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();
            this.graphics.buttonMode = true;
            this.graphics.defaultCursor = 'ew-resize';
            this.displayObject.addChild(this.graphics);

            this.updateMVT(this.mvt);
        },

        drawTarget: function() {
            this.graphics.clear();
            this.graphics.lineStyle(TargetView.LINE_WIDTH, TargetView.LINE_COLOR, 1);
            
            // Paint the rings from the outside one to the inside
            var totalWidth  = this.mvt.modelToViewDeltaX(this.model.get('radius')) * 2;
            var totalHeight = this.mvt.modelToViewDeltaY(this.model.get('radius')) * 2 * TargetView.PERSPECTIVE_MODIFIER;
            var widthPerRing  = totalWidth  / TargetView.NUM_RINGS;
            var heightPerRing = totalHeight / TargetView.NUM_RINGS;
            var ellipseWidth;
            var ellipseHeight;
            for (var i = RING_COLORS.length - 1; i >= 0; i--) {
                ellipseWidth  = widthPerRing  * (i + 1);
                ellipseHeight = heightPerRing * (i + 1);
                this.graphics.beginFill(RING_COLORS[i], 1);
                this.graphics.drawEllipse(0, 0, ellipseWidth / 2, ellipseHeight / 2);
                this.graphics.endFill();
            }
        },

        dragStart: function(data) {
            console.log('drag start');
            this.previousX = data.global.x;
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.previousX;
                this.previousX = data.global.x;

                dx = this.mvt.viewToModelDeltaY(dx);

                var x = this.model.get('x') + dx;
                if (x < 1)
                    x = 1;
                this.model.set('x', x);

                this.updatePosition();
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        updatePosition: function() {
            this.displayObject.x = this.mvt.modelToViewX(this.model.get('x'));
            this.displayObject.y = this.mvt.modelToViewY(this.model.get('y'));
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updatePosition();
            this.drawTarget();
        }

    }, Constants.TargetView);

    return TargetView;
});