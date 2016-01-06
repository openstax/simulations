define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Draggable = require('common/tools/draggable');
    var Vector2   = require('common/math/vector2');

    var html = require('text!templates/ammeter.html');

    require('less!styles/ammeter');

    var dx,
        dy,
        translate;

    var AmmeterView = Draggable.extend({

        template: _.template(html),

        tagName: 'div',
        className: 'ammeter-view',

        events: {
            'mousedown' : 'dragStart',
            'touchstart': 'dragStart'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            Draggable.prototype.initialize.apply(this, [options]);

            this.position = new Vector2();
            this.lastFieldVector = new Vector2();
        },

        render: function() {
            this.renderFieldMeter();
            this.bindDragEvents();
            this.resize();
            this.update();
            this.hide();

            return this;
        },

        renderFieldMeter: function() {
            this.$el.html(this.template());

            this.$amperage = this.$('.amperage');
            this.$activeOverlay = this.$('.ammeter-active-overlay');
        },

        update: function(time, delta, paused, timeScale) {
            translate = 'translateX(' + this.position.x + 'px) translateY(' + this.position.y + 'px)';

            this.$el.css({
                '-webkit-transform': translate,
                '-ms-transform': translate,
                '-o-transform': translate,
                'transform': translate,
            });

            this.updateValues();
        },

        updateValues: function() {
            // Get the current from the circuit at this location
            var branch = null;
            if (branch) {
                this.$activeOverlay.show();
                this.$amperage.html();
            }
            else {
                this.$activeOverlay.hide();
                this.$amperage.html();
            }
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

                this.position.add(dx, dy);
                this.updateOnNextFrame = true;

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
            this.position.set(x, y);
            this.updateOnNextFrame = true;
        },

        show: function() {
            this.update();
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        }

    });

    return AmmeterView;
});
