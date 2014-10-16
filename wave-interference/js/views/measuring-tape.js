define(function (require) {

	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	var SimDraggable = require('views/sim-draggable');

	var Utils = require('utils/utils');
	var html  = require('text!templates/measuring-tape.html');

	var padding,
	    angle,
	    lineLength,
	    startX,
	    startY,
	    dx,
	    dy,
	    translate,
	    rotate;

	var MeasuringTapeView = SimDraggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'measuring-tape-view',

		events: {
			'mousedown  .measuring-tape-handle' : 'handleDown',
			'touchstart .measuring-tape-handle' : 'handleDown',
			'mousedown  .measuring-tape' : 'tapeDown',
			'touchstart .measuring-tape': 'tapeDown',

			'click .measuring-tape-label': 'labelClicked'
		},

		initialize: function(options) {
			options = _.extend({
				start: {
					x: 30,
					y: 30
				},
				end: {
					x: 120,
					y: 30
				}
			}, options);

			SimDraggable.prototype.initialize.apply(this, [options]);

			this.start = options.start;
			this.end   = options.end;

			this.units = this.waveSimulation.get('units').distance;
		},

		render: function() {
			this.renderMeasuringTape();
			this.bindDragEvents();
			this.resize();
			this.update(0, 0);
		},

		renderMeasuringTape: function() {
			this.$el.html(this.template());
			this.$tape = this.$('.measuring-tape');
			this.$label = this.$('.measuring-tape-label');
		},

		resize: function(){
			SimDraggable.prototype.resize.apply(this);

			if (!this.visible) {
				var offset = this.heatmapView.$el.offset();
				var width  = this.heatmapView.$el.width();
				var height = this.heatmapView.$el.height();
				this.start.x = offset.left + width * 0.33 - this.dragOffset.left;
				this.start.y = offset.top + width / 2 - this.dragOffset.top;
				this.end.x = offset.left + width * 0.67 - this.dragOffset.left;
				this.end.y = offset.top + width / 2 - this.dragOffset.top;
			}
		},

		handleDown: function(event) {
			event.preventDefault();

			if ($(event.target).index() === 0)
				this.draggingStart = true;
			else
				this.draggingEnd = true;

			this.fixTouchEvents(event);

			this.dragX = event.pageX;
			this.dragY = event.pageY;

			$(event.target).addClass('dragging');
		},

		tapeDown: function(event) {
			if (event.target === this.$tape[0]) {
				event.preventDefault();

				this.$el.addClass('dragging');

				this.draggingTape = true;

				this.fixTouchEvents(event);

				this.dragX = event.pageX;
				this.dragY = event.pageY;
			}
		},

		drag: function(event) {
			if (this.draggingStart || this.draggingEnd) {

				this.fixTouchEvents(event);

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				if (this.draggingStart && !this.outOfBounds(this.start.x + dx, this.start.y + dy)) {
					this.start.x += dx;
					this.start.y += dy;
				}
				if (this.draggingEnd && !this.outOfBounds(this.end.x + dx, this.end.y + dy)) {
					this.end.x += dx;
					this.end.y += dy;
				}

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
			else if (this.draggingTape) {

				this.fixTouchEvents(event);

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				if (!this.outOfBounds(this.start.x + dx, this.start.y + dy) &&
					!this.outOfBounds(this.end.x   + dx, this.end.y   + dy)) {

					this.start.x += dx;
					this.start.y += dy;
					this.end.x += dx;
					this.end.y += dy;
				}

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
		},

		dragEnd: function(event) {
			if (this.draggingStart || this.draggingEnd) {
				this.draggingStart = false;
				this.draggingEnd   = false;
				this.$('.measuring-tape-handle').removeClass('dragging');
			}
			else if (this.draggingTape) {
				this.draggingTape = false;
				this.$el.removeClass('dragging');
			}
		},

		labelClicked: function(event) {
			Utils.selectText(event.target);
		},

		update: function(time, delta) {
			// If there aren't any changes, don't do anything.
			if (!this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			padding = this.$tape.height() / 2;

			angle = -Utils.angleFromLine(
				this.start.x, 
				this.start.y, 
				this.end.x, 
				this.end.y
			);

			lineLength = Utils.lineLength(
				this.start.x, 
				this.start.y, 
				this.end.x, 
				this.end.y
			);

			startX = this.start.x;
			startY = this.start.y - padding;

			translate = 'translateX(' + startX + 'px) translateY(' + startY + 'px)';
			rotate = 'rotateZ(' + (-angle) + 'deg)';

			this.$el.css({
				'-webkit-transform': translate,
				'-ms-transform': translate,
				'-o-transform': translate,
				'transform': translate,
			});

			this.$tape.css({
				width: lineLength,

				'-webkit-transform': rotate,
				'-ms-transform': rotate,
				'-o-transform': rotate,
				'transform': rotate,
			});

			this.$label.html(this.toSimXScale(lineLength).toFixed(2) + ' ' + this.units);
		}
	});

	return MeasuringTapeView;
});
