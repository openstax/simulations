define(function (require) {

    'use strict';

    var _ = require('underscore');

    var selectText = require('../dom/select-text');
    var Draggable = require('./draggable');

    var html  = require('text!./reference-line.html');

    require('less!./reference-line');

    var dx,
        dy,
        translate;

    var ReferenceLineView = Draggable.extend({

        template: _.template(html),

        tagName: 'div',
        className: 'reference-line-view',

        events: {
            'mousedown' : 'panelDown',
            'touchstart': 'panelDown'
        },

        initialize: function(options) {
            options = _.extend({
                position: {
                    x: 30,
                    y: 30
                },
                captureOnBody: false,
                mouseLeaveCancels: true,
                width: 400
            }, options);

            Draggable.prototype.initialize.apply(this, [options]);

            this.position = options.position;
            this.width = options.width;
        },

        render: function() {
            this.renderReferenceLine();
            this.bindDragEvents();
            this.resize();
            this.update();
        },

        renderReferenceLine: function() {
            this.$el.html(this.template());
            this.$el.css({width: this.width + 'px'});
        },

        panelDown: function(event) {
            if (event.target === this.el) {
                event.preventDefault();

                this.$el.addClass('dragging');

                this.dragging = true;

                this.fixTouchEvents(event);

                this.dragX = event.pageX;
                this.dragY = event.pageY;
            }
        },

        drag: function(event) {
            if (this.dragging) {

                this.fixTouchEvents(event);

                // Pinning dragging to vertical only
                // dx = event.pageX - this.dragX;
                dx = 0;
                dy = event.pageY - this.dragY;

                if (!this.boxOutOfBounds(this.position.x + dx, this.position.y + dy)) {

                    this.position.x += dx;
                    this.position.y += dy;
                }

                // Pinning dragging to vertical only
                // this.dragX = event.pageX;
                this.dragX = 0;
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
        }
    });

    return ReferenceLineView;
});
