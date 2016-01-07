define(function (require) {

    'use strict';

    var _   = require('underscore');
    var SAT = require('sat');

    var Draggable = require('common/tools/draggable');
    var Vector2   = require('common/math/vector2');

    var Constants = require('constants');

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

            this.visible = true;
            this.point = new SAT.Vector();
            this.position = new Vector2();
            this.lastFieldVector = new Vector2();

            Draggable.prototype.initialize.apply(this, [options]);
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

            this.$readout       = this.$('.ammeter-readout');
            this.$hint          = this.$('.ammeter-hint');
            this.$amperage      = this.$('.amperage');
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
            if (!this.visible)
                return;

            // Calculate the current position in model space
            var modelPoint = this.mvt.viewToModel(this.position).scale(Constants.SAT_SCALE);
            this.point.x = modelPoint.x;
            this.point.y = modelPoint.y;

            // Get the current from the circuit at this location
            var branch = this.simulation.circuit.getIntersectingBranch(this.point);
            if (branch) {
                this.$activeOverlay.show();
                this.$readout.show();
                this.$hint.hide();
                this.$amperage.html();
            }
            else {
                this.$activeOverlay.hide();
                this.$readout.hide();
                this.$hint.show();
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
            this.visible = true;
        },

        hide: function() {
            this.$el.hide();
            this.visible = false;
        }

    });

    return AmmeterView;
});
