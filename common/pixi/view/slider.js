define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView       = require('common/pixi/view');
    var Colors         = require('common/colors/colors');

    /**
     * A view that represents an element model
     */
    var SliderView = PixiView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',
        },

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                start: 5,
                step: false,
                range: {
                    min: 0,
                    max: 10
                },
                orientation: 'horizontal',
                direction: 'rtl',

                // Settings for generating graphics if the actual DisplayObjects aren't given
                width: 100,
                backgroundHeight: 6,
                backgroundColor: '#ededed',
                handleSize: 20,
                handleColor: '#21366B'
            }, options);

            this.start = options.start;
            this.step  = options.step;
            this.range = options.range;
            this.orientation = options.orientation;
            this.direction = options.direction;

            options.backgroundColor = Colors.parseHex(options.backgroundColor);
            options.handleColor     = Colors.parseHex(options.handleColor);

            if (options.handle === undefined) {
                options.handle = new PIXI.Graphics();
                options.handle.beginFill(options.handleColor, 1);
                options.handle.drawCircle(0, 0, options.handleSize / 2);
            }

            if (options.background === undefined) {
                options.background = new PIXI.Graphics();
                options.background.beginFill(options.backgroundColor, 1);
                if (this.vertical())
                    options.background.drawRect(0, 0, options.backgroundHeight, options.width / 2);
                else
                    options.background.drawRect(0, 0, options.width / 2, options.backgroundHeight);
            }

            this.handle     = options.handle;
            this.background = options.background;

            this.displayObject.addChild(this.background);
            this.displayObject.addChild(this.handle);
        },

        rtl: function() {
            return this.direction === 'rtl';
        },

        vertical: function() {
            return this.orientation !== 'horizontal';
        },

        calculateDragBounds: function(dx, dy) {
            var bounds = this.displayObject.getBounds();
            return this._dragBounds.set(
                bounds.x + dx,
                bounds.y + dy,
                bounds.width,
                bounds.height
            );
        },

        dragStart: function(data) {
            if (this.movable) {
                this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
                this.dragging = true;
                this.model.set('userControlled', true);    
            }
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                var newBounds = this.calculateDragBounds(dx, dy);
                var constraintBounds = this.movementConstraintBounds;

                if (!constraintBounds.contains(newBounds)) {
                    var overflowLeft   = constraintBounds.left() - newBounds.left();
                    var overflowRight  = newBounds.right() - constraintBounds.right();
                    var overflowTop    = constraintBounds.bottom() - newBounds.bottom();
                    var overflowBottom = newBounds.top() - constraintBounds.top();

                    // Backtrack if we need to
                    if (overflowLeft > 0)
                        dx += overflowLeft;
                    else if (overflowRight > 0)
                        dx -= overflowRight;

                    if (overflowTop > 0)
                        dy += overflowTop;
                    else if (overflowBottom > 0)
                        dy -= overflowBottom;
                }

                dx = this.mvt.viewToModelDeltaX(dx);
                dy = this.mvt.viewToModelDeltaY(dy);

                var newPosition = this._newPosition
                    .set(this.model.get('position'))
                    .add(dx, dy);

                var validatedPosition = this.movementConstraint(this.model, newPosition);
                    this.model.setPosition(validatedPosition);

                this.dragX = data.global.x;
                this.dragY = data.global.y;
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
            this.dragData = null;
            this.model.set('userControlled', false);
        },

    });

    return SliderView;
});