define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi'); require('common/pixi/extensions');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Rectangle = require('common/math/rectangle');

    /**
     * A view that represents an element model
     */
    var SliderView = PixiView.extend({

        events: {
            'touchstart      .handle': 'dragStart',
            'mousedown       .handle': 'dragStart',
            'touchmove       .handle': 'drag',
            'mousemove       .handle': 'drag',
            'touchend        .handle': 'dragEnd',
            'mouseup         .handle': 'dragEnd',
            'touchendoutside .handle': 'dragEnd',
            'mouseupoutside  .handle': 'dragEnd',
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
                handleColor: '#21366B',

                // Optional event listeners
                onSlide:  function() {},
                onChange: function() {},
                onSet:    function() {}
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
                    options.background.drawRect(-options.width / 2, 0, options.backgroundHeight, options.width / 2);
                else
                    options.background.drawRect(0, -options.backgroundHeight / 2, options.width / 2, options.backgroundHeight);
            }

            this.handle     = options.handle;
            this.background = options.background;

            this.width  = this.background.width;
            this.height = this.background.height;

            this.displayObject.addChild(this.background);
            this.displayObject.addChild(this.handle);

            // Cached objects
            this._dragBounds     = new Rectangle();
            this._dragOffset     = new PIXI.Point();
            this._globalPosition = new PIXI.Point();

            //this.positionHandle();

            this.on('slide',  options.onSlide);
            this.on('change', options.onChange);
            this.on('set',    options.onSet);
        },

        rtl: function() {
            return this.direction === 'rtl';
        },

        vertical: function() {
            return this.orientation !== 'horizontal';
        },

        positionHandle: function() {
            this.handle.x = this.width * this.percentage();
        },

        percentage: function() {
            return (this.value - this.range.min) / (this.range.max - this.range.min);
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
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
            this.previousValue = this.value;
        },

        drag: function(data) {
            if (this.dragging) {
                var handlePosition = this.handle.toGlobal(this._globalPosition);
                var dx = data.global.x - handlePosition.x - this.dragOffset.x;
                
                if (this.handle.x + dx > this.width)
                    this.handle.x = this.width;
                else if (this.handle.x + dx < 0)
                    this.handle.x = 0;
                else
                    this.handle.x += dx;

                var previousValue = this.value;
                this.value = this.percentage() * (this.range.max - this.range.min) + this.range.min;
                this.trigger('slide', this.value, previousValue);

                this.dragX = data.global.x;
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
            this.dragData = null;
            this.trigger('set',    this.value, this.previousValue);
            this.trigger('change', this.value, this.previousValue);
        },

        val: function(val) {
            if (val !== undefined) {
                var previousValue = this.value;
                this.value = val;
                this.trigger('set', this.value, previousValue);
            }
            else
                return this.value;
        }

    });

    return SliderView;
});