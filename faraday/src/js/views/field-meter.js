define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Draggable = require('common/tools/draggable');
    var Vector2   = require('common/math/vector2');

    var html = require('text!templates/field-meter.html');

    require('less!styles/field-meter');

    var dx,
        dy,
        translate;

    var FieldMeterView = Draggable.extend({

        template: _.template(html),

        tagName: 'div',
        className: 'field-meter-view',

        events: {
            'mousedown' : 'dragStart',
            'touchstart': 'dragStart'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.magnetModel = options.magnetModel;

            Draggable.prototype.initialize.apply(this, [options]);

            

            this.position = new Vector2();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        render: function() {
            this.renderFieldMeter();
            this.bindDragEvents();
            this.resize();
            this.update();

            return this;
        },

        renderFieldMeter: function() {
            this.$el.html(this.template());
            
            // this.$('.bar-meter-bar').css('background-color', this.barColor);
            // this.$('.bar-meter-overflow').css('color', this.barColor);
            // this.$('.bar-meter-title').html(this.title);

            // this.$min = this.$('.bar-meter-min-value');
            // this.$max = this.$('.bar-meter-max-value');

            // this.$value    = this.$('.bar-meter-value');
            // this.$bar      = this.$('.bar-meter-bar');
            // this.$overflow = this.$('.bar-meter-overflow');
        },

        postRender: function() {
            Draggable.prototype.postRender.apply(this, arguments);

        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.position.x = viewPosition.x;
            this.position.y = viewPosition.y;
            this.updateOnNextFrame = true;
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

                var mx = this.model.get('position').x + this.mvt.viewToModelDeltaX(dx);
                var my = this.model.get('position').y + this.mvt.viewToModelDeltaY(dy);

                this.model.setPosition(mx, my);

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

    return FieldMeterView;
});
