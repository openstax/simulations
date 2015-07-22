define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Draggable = require('common/tools/draggable');
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
            'mousedown' : 'dragStart',
            'touchstart': 'dragStart'
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

            this.updateMin();
            this.updateMax();
        },

        dragStart: function(event) {
            //if (event.currentTarget === this.el) {
                event.preventDefault();

                this.$el.addClass('dragging');

                this.dragging = true;

                this.fixTouchEvents(event);

                this.dragX = event.pageX;
                this.dragY = event.pageY;
            //}
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
                'margin-top': -this.$min.height() / 2
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

        showOverflow: function() {
            
        }
    });

    return BarMeterView;
});
