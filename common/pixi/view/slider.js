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

            'mousedown  .background': 'backgroundTouchStart',
            'touchstart .background': 'backgroundTouchStart',
            'touchend        .background': 'backgroundTouchEnd',
            'mouseup         .background': 'backgroundTouchEnd',
            'touchendoutside .background': 'backgroundTouchEnd',
            'mouseupoutside  .background': 'backgroundTouchEnd',
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
                backgroundHeight: 2,
                backgroundColor: '#ededed',
                handleSize: 10,
                handleColor: '#21366B',
                handleLineColor: '#000',
                handleLineWidth: 0,

                // Optional event listeners
                onSlide:  function() {},
                onChange: function() {},
                onSet:    function() {}
            }, options);

            this.value = options.start;
            this.step  = options.step;
            this.range = options.range;
            this.orientation = options.orientation;
            this.direction = options.direction;

            options.backgroundColor = Colors.parseHex(options.backgroundColor);
            options.handleColor     = Colors.parseHex(options.handleColor);
            options.handleLineColor = Colors.parseHex(options.handleLineColor);

            if (options.handle === undefined) {
                options.handle = new PIXI.Graphics();
                options.handle.beginFill(options.handleColor, 1);
                options.handle.lineStyle(options.handleLineWidth, options.handleLineColor, 1);
                options.handle.drawCircle(0, 0, options.handleSize * 0.8);
                options.handle.scale.x = options.handle.scale.y = 0.8;
                this.on('drag-start', function(){
                    this.handle.scale.x = this.handle.scale.y = 1;
                });
                this.on('drag-end', function(){
                    this.handle.scale.x = this.handle.scale.y = 0.8;
                });
            }

            if (options.background === undefined) {
                options.background = new PIXI.Graphics();
                options.background.beginFill(options.backgroundColor, 1);
                if (this.vertical())
                    options.background.drawRect(-options.backgroundHeight / 2, 0, options.backgroundHeight, options.width);
                else
                    options.background.drawRect(0, -options.backgroundHeight / 2, options.width, options.backgroundHeight);
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
            this._touchLocation  = new PIXI.Point();

            this.positionHandle();
            this.handle.buttonMode = true;

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
            var percentage = this.percentage();
            if (!this.rtl())
                percentage = 1 - percentage;

            if (this.vertical())
                this.handle.y = this.height * percentage;
            else
                this.handle.x = this.width * percentage;
        },

        percentage: function() {
            return (this.value - this.range.min) / (this.range.max - this.range.min);
        },

        dragStart: function(data, dragOffset) {
            this.dragOffset = dragOffset === undefined ? data.getLocalPosition(this.handle, this._dragOffset) : dragOffset;
            this.dragging = true;
            this.previousValue = this.value;
            this.trigger('drag-start');
        },

        drag: function(data) {
            if (this.dragging) {
                var handlePosition = this.handle.toGlobal(this._globalPosition);
                var percentage;
                
                if (this.vertical()) {
                    var dy = data.global.y - handlePosition.y - this.dragOffset.y;

                    if (this.handle.y + dy > this.height)
                        this.handle.y = this.height;
                    else if (this.handle.y + dy < 0)
                        this.handle.y = 0;
                    else
                        this.handle.y += dy;

                    percentage = this.handle.y / this.height;
                }
                else {
                    var dx = data.global.x - handlePosition.x - this.dragOffset.x;
                    
                    if (this.handle.x + dx > this.width)
                        this.handle.x = this.width;
                    else if (this.handle.x + dx < 0)
                        this.handle.x = 0;
                    else
                        this.handle.x += dx;

                    percentage = this.handle.x / this.width;
                }

                if (!this.rtl())
                    percentage = 1 - percentage;

                this.previousValue = this.value;
                this.value = percentage * (this.range.max - this.range.min) + this.range.min;
                this.trigger('slide', this.value, this.previousValue);
            }
        },

        dragEnd: function(data) {
            if (this.dragging) {
                this.dragging = false;
                this.dragData = null;
                this.trigger('set',    this.value, this.previousValue);
                this.trigger('change', this.value, this.previousValue);
                this.trigger('drag-end');    
            }
        },

        backgroundTouchStart: function(data) {
            var touchLocation = data.getLocalPosition(this.background, this._touchLocation);

            var percentage;
            if (this.vertical())
                percentage = touchLocation.y / this.height;
            else
                percentage = touchLocation.x / this.width;

            if (!this.rtl())
                percentage = 1 - percentage;

            this.previousValue = this.value;
            this.value = (percentage * (this.range.max - this.range.min) + this.range.min);
            this.positionHandle();
            this.trigger('slide', this.value, this.previousValue)

            var dragOffset = this._dragOffset;
            dragOffset.x = 0;
            dragOffset.y = 0;
            this.dragStart(data, dragOffset);
        },

        backgroundTouchEnd: function(data) {
            this.dragEnd();
        },

        val: function(val) {
            if (val !== undefined) {
                this.previousValue = this.value;
                this.value = val;
                this.positionHandle();
                this.trigger('set', this.value, this.previousValue);
            }
            else
                return this.value;
        }

    });

    return SliderView;
});