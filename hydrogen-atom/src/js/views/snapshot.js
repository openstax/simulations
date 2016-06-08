define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Draggable = require('common/tools/draggable');

    var html  = require('text!hydrogen-atom/templates/snapshot.html');

    require('less!hydrogen-atom/styles/snapshot');

    var dx,
        dy,
        translate;

    var SnapshotView = Draggable.extend({

        template: _.template(html),

        tagName: 'div',
        className: 'snapshot-view',

        events: {
            'mousedown' : 'panelDown',
            'touchstart': 'panelDown',

            'click .close' : 'closeClicked',
        },

        initialize: function(options) {
            options = _.extend({
                title: 'Snapshot',
                position: {
                    x: 30,
                    y: 30
                },
                captureOnBody: false,
                mouseLeaveCancels: false
            }, options);

            this.title = options.title;
            this.position = options.position;
            this.sourceCanvas = options.sourceCanvas;

            Draggable.prototype.initialize.apply(this, [options]);

            this.render()
        },

        render: function() {
            this.$el.html(this.template({ title: this.title }));
            this.canvas = this.$('canvas')[0];
            this.initCanvas();
            this.bindDragEvents();
            this.resize();
            this.update(0, 0);
        },

        initCanvas: function() {
            var sourceCanvas = this.sourceCanvas;
            var canvas = this.canvas;
            var ctx = canvas.getContext('2d');

            canvas.width = sourceCanvas.width;
            canvas.height = sourceCanvas.height;
            canvas.style.width = sourceCanvas.clientWidth + 'px';
            canvas.style.height = sourceCanvas.clientHeight + 'px';

            ctx.drawImage(sourceCanvas, 0, 0);
        },

        panelDown: function(event) {
            if (event.currentTarget === this.el) {
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

                dx = event.pageX - this.dragX;
                dy = event.pageY - this.dragY;

                // if (!this.boxOutOfBounds(this.position.x + dx, this.position.y + dy)) {
                    this.position.x += dx;
                    this.position.y += dy;
                // }

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

        update: function(time, delta, paused) {
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

        closeClicked: function() {
            this.$el.remove();
        }

    });

    return SnapshotView;
});
