define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Draggable = require('common/tools/draggable');
    var Vector2   = require('common/math/vector2');

    var html = require('text!templates/field-meter.html');

    require('less!styles/field-meter');

    var STRING_MAGNITUDE_NEGATIVE_ZERO = "-0.00";
    var STRING_MAGNITUDE_POSITIVE_ZERO = "0.00";
    var STRING_ANGLE_NEGATIVE_ZERO = "-0.00";
    var STRING_ANGLE_POSITIVE_ZERO = "0.00";
    var STRING_ANGLE_NEGATIVE_PI = "-180.00";
    var STRING_ANGLE_POSITIVE_PI = "180.00";

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

            this.model.set('enabled', true);

            this.position = new Vector2();
            this.lastFieldVector = new Vector2();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        render: function() {
            this.renderFieldMeter();
            this.bindDragEvents();
            this.updatePosition(this.model, this.model.get('position'));
            this.resize();
            this.update();

            return this;
        },

        renderFieldMeter: function() {
            this.$el.html(this.template());

            this.$bBar  = this.$('.b-bar');
            this.$bBarX = this.$('.b-bar-x');
            this.$bBarY = this.$('.b-bar-y');
            this.$theta = this.$('.theta');
        },

        // postRender: function() {
        //     Draggable.prototype.postRender.apply(this, arguments);
        // },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.position.x = viewPosition.x;
            this.position.y = viewPosition.y;
            this.updateOnNextFrame = true;
        },

        update: function(time, delta, paused, timeScale) {
            if (this.model.get('enabled')) {
                translate = 'translateX(' + this.position.x + 'px) translateY(' + this.position.y + 'px)';

                this.$el.css({
                    '-webkit-transform': translate,
                    '-ms-transform': translate,
                    '-o-transform': translate,
                    'transform': translate,
                });

                this.updateValues();    
            }
        },


        updateValues: function() {
            // Get the field vector from the model.
            var fieldVector = this.model.getStrength();
            if (fieldVector.equals(this.lastFieldVector))
                return;

            // Get the components, adjust the coordinate system.
            var b = fieldVector.length();
            var bx = fieldVector.x;
            var by = -fieldVector.y; // +Y is up
            var angle = -fieldVector.angle();  // +angle is counterclockwise

            // Convert the angle to a value in the range -180...180 degrees.
            // Normalize the angle to the range -360...360 degrees
            if (Math.abs(angle) >= (2 * Math.PI)) {
                var sign = (angle < 0) ? -1 : +1;
                angle = sign * (angle % (2 * Math.PI));
            }

            // Convert to an equivalent angle in the range -180...180 degrees.
            if (angle < -Math.PI)
                angle = angle + (2 * Math.PI);
            else if (angle > Math.PI)
                angle = angle - (2 * Math.PI);

            var bString = b.toFixed(2);
            var bxString = bx.toFixed(2);
            var byString = by.toFixed(2);
            var angleString = (angle * (180 / Math.PI)).toFixed(2);

            /*
             * Correct some offensive looking values.
             * We need to perform this format-dependent check on the strings
             * because a value like -0.00005 will display as -0.00.
             */
            // B
            if (bString == STRING_MAGNITUDE_NEGATIVE_ZERO)
                bString = STRING_MAGNITUDE_POSITIVE_ZERO;

            if (bString == STRING_MAGNITUDE_POSITIVE_ZERO) {
                // If B displays 0, all others should display zero.
                bxString = STRING_MAGNITUDE_POSITIVE_ZERO;
                byString = STRING_MAGNITUDE_POSITIVE_ZERO;
                angleString = STRING_ANGLE_POSITIVE_ZERO;
            }
            else {
                // Bx
                if (bxString == STRING_MAGNITUDE_NEGATIVE_ZERO)
                    bxString = STRING_MAGNITUDE_POSITIVE_ZERO;

                // By
                if (byString == STRING_MAGNITUDE_NEGATIVE_ZERO)
                    byString = STRING_MAGNITUDE_POSITIVE_ZERO;

                // Theta
                if (angleString == STRING_ANGLE_NEGATIVE_ZERO)
                    angleString = STRING_ANGLE_POSITIVE_ZERO;
                else if ( angleString == STRING_ANGLE_NEGATIVE_PI)
                    angleString = STRING_ANGLE_POSITIVE_PI;
            }

            // Update the view
            this.$bBar.html(bString);
            this.$bBarX.html(bxString);
            this.$bBarY.html(byString);
            this.$theta.html(angleString);

            this.lastFieldVector.set(fieldVector);
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
            this.model.set('enabled', true);
            this.$el.show();
        },

        hide: function() {
            this.model.set('enabled', false);
            this.$el.hide();
        }

    });

    return FieldMeterView;
});
