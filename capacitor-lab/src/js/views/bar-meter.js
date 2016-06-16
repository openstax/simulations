define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Draggable = require('common/v3/tools/draggable');
    var Vector2   = require('common/math/vector2');

    var html  = require('text!templates/bar-meter.html');

    require('less!styles/bar-meter');

    var dx,
        dy,
        translate;

    var BarMeterView = Draggable.extend({

        template: _.template(html),

        tagName: 'div',
        className: 'bar-meter-view',

        events: {
            'mousedown  .bar-meter-drag-area': 'dragStart',
            'touchstart .bar-meter-drag-area': 'dragStart',

            'click .btn-zoom-in' : 'zoomIn',
            'click .btn-zoom-out': 'zoomOut'
        },

        initialize: function(options) {
            options = _.extend({
                units: 'C',
                decimals: 2,
                barColor: '#000',
                title: 'Bar Meter',
                exponent: -13
            }, options);

            Draggable.prototype.initialize.apply(this, [options]);

            this.units = options.units;
            this.decimals = options.decimals;
            this.barColor = options.barColor;
            this.title = options.title;
            this.exponent = options.exponent;

            this.position = new Vector2();
        },

        render: function() {
            this.renderBarMeter();
            this.bindDragEvents();
            this.resize();
            this.update();
        },

        renderBarMeter: function() {
            this.$el.html(this.template());
            
            this.$('.bar-meter-bar').css('background-color', this.barColor);
            this.$('.bar-meter-overflow').css('color', this.barColor);
            this.$('.bar-meter-title').html(this.title);

            this.$min = this.$('.bar-meter-min-value');
            this.$max = this.$('.bar-meter-max-value');

            this.$value    = this.$('.bar-meter-value');
            this.$bar      = this.$('.bar-meter-bar');
            this.$overflow = this.$('.bar-meter-overflow');
        },

        postRender: function() {
            Draggable.prototype.postRender.apply(this, arguments);

            this.calculateExponent();
            this.updateMin();
            this.updateMax();
            this.updateZoomButtons();

            this.hide();
        },

        setPosition: function(x, y) {
            this.position.x = x;
            this.position.y = y;
            this.updateOnNextFrame = true;
        },

        setValue: function(value) {
            var mantissa = value / (Math.pow(10, this.exponent));
            var max = Math.pow(10, this.exponent);
            var percent = (value / max) * 100;
            if (percent > 100) {
                percent = 100;
                this.$overflow.show();
            }
            else
                this.$overflow.hide();

            this.$value.html(mantissa.toFixed(this.decimals) + 'x10<sup>' + this.exponent + '</sup> ' + this.units);
            this.$bar.css('height', percent + '%');

            this.value = value;
        },

        updateMin: function() {
            this.$min.html('0');
            this.$min.css({
                'margin-bottom': -this.$min.height() / 2
            });
        },

        updateMax: function() {
            this.$max.html('10<sup>' + this.exponent + '</sup>');
            this.$max.css({
                'margin-top': -this.$max.height() / 2
            });
        },

        update: function(time, delta, paused, timeScale) {
            // If there aren't any changes, don't do anything.
            if (!this.updateOnNextFrame)
                return;

            this.updateOnNextFrame = false;

            translate = 'translateX(' + this.position.x + 'px) translateY(' + this.position.y + 'px)';

            this.$el.css({
                '-webkit-transform': translate,
                '-ms-transform': translate,
                '-o-transform': translate,
                'transform': translate,
            });
        },

        zoomIn: function(event) {
            this.calculateExponent();
            this.updateZoomButtons();
        },

        zoomOut: function(event) {
            this.calculateExponent();
            this.updateZoomButtons();
        },

        calculateExponent: function() {
            if (this.value !== 0) {
                var exponent = 0;
                while ((this.value / Math.pow(10, exponent)) < 0.1)
                    exponent--;

                this.exponent = exponent;

                this.updateMax();
                this.setValue(this.value);
            }
        },

        /**
         * At most one of the zoom buttons is enabled.
         * If the bar is empty, neither button is enabled.
         * If the bar is less than 10% full, the zoom in button is enabled.
         * If the bar is overflowing, the zoom out button is enabled.
         */
        updateZoomButtons: function() {
            this.$('.btn-zoom-in, .btn-zoom-out').prop('disabled', true);

            var mantissa = this.value / Math.pow(10, this.exponent);

            if ((this.value !== 0) && (mantissa < 0.1))
                this.$('.btn-zoom-in').removeAttr('disabled');

            if ((this.value !== 0) && (mantissa > 1))
                this.$('.btn-zoom-out').removeAttr('disabled');
        },

        dragStart: function(event) {
            event.preventDefault();

            this.$el.addClass('dragging');

            this.dragging = true;

            this.fixTouchEvents(event);

            this.dragX = event.pageX;
            this.dragY = event.pageY;
        },

        drag: function(event) {
            if (this.dragging) {

                this.fixTouchEvents(event);

                dx = event.pageX - this.dragX;
                dy = event.pageY - this.dragY;

                if (!this.boxOutOfBounds(this.position.x + dx, this.position.y + dy)) {
                    this.position.x += dx;
                    this.position.y += dy;
                }

                this.dragX = event.pageX;
                this.dragY = event.pageY;

                this.updateOnNextFrame = true;
            }
        },

        dragEnd: function(event) {
            if (this.dragging) {
                this.dragging = false;
                this.$el.removeClass('dragging');
            }
        },

        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        }

    });

    return BarMeterView;
});
