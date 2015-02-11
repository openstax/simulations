define(function (require) {

	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	var Vector2    = require('../math/vector2');
	var selectText = require('../dom/select-text');
	var Draggable  = require('./draggable');

	var html  = require('text!./measuring-tape.html');

	require('less!./measuring-tape');

	var padding,
	    angle,
	    lineLength,
	    modelLineLength,
	    startX,
	    startY,
	    dx,
	    dy,
	    translate,
	    rotate;
	var line = new Vector2();

	var RADIANS_TO_DEGREES = 180 / Math.PI;

	var MeasuringTapeView = Draggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'measuring-tape-view',

		events: {
			'mousedown  .measuring-tape-handle': 'handleDown',
			'touchstart .measuring-tape-handle': 'handleDown',
			'mousedown  .measuring-tape': 'tapeDown',
			'touchstart .measuring-tape': 'tapeDown',

			'click .measuring-tape-label': 'labelClicked'
		},

		initialize: function(options) {
			options = _.extend({
				start: new Vector2( 30, 30),
				end:   new Vector2(120, 30),
				viewToModelDeltaX: function() { return 1; },
				viewToModelDeltaY: function() { return 1; },
				units: 'm',
				decimalPlaces: 2
			}, options);

			Draggable.prototype.initialize.apply(this, [options]);

			this.start = options.start;
			this.end   = options.end;

			this.units = options.units;
			this.decimalPlaces = options.decimalPlaces;

			this.viewToModelDeltaX = options.viewToModelDeltaX;
			this.viewToModelDeltaY = options.viewToModelDeltaY;
		},

		render: function() {
			this.renderMeasuringTape();
			this.bindDragEvents();
		},

		renderMeasuringTape: function() {
			this.$el.html(this.template());
			this.$tape = this.$('.measuring-tape');
			this.$label = this.$('.measuring-tape-label');
		},

		postRender: function() {
		    Draggable.prototype.postRender.apply(this);

		    this.update(0, 0);
		},

		resize: function(){
			Draggable.prototype.resize.apply(this);
		},

		setStart: function(x, y) {
			this.start.x = x;
			this.start.y = y;
			this.updateOnNextFrame = true;
		},

		setEnd: function(x, y) {
			this.end.x = x;
			this.end.y = y;
			this.updateOnNextFrame = true;
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
			selectText(event.target);
		},

		update: function(time, delta) {
			// If there aren't any changes, don't do anything.
			if (!this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			padding = this.$tape.height() / 2;

			line.set(this.end).sub(this.start);

			angle = line.angle() * RADIANS_TO_DEGREES;

			lineLength = line.length();

			startX = this.start.x;
			startY = this.start.y - padding;

			translate = 'translateX(' + startX + 'px) translateY(' + startY + 'px)';
			rotate = 'rotateZ(' + (angle) + 'deg)';

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

			modelLineLength = Math.sqrt(
				Math.pow(this.viewToModelDeltaX(this.end.x - this.start.x), 2) + 
				Math.pow(this.viewToModelDeltaY(this.end.y - this.start.y), 2)
			);

			this.$label.html(modelLineLength.toFixed(this.decimalPlaces) + ' ' + this.units);
		},

		show: function() {
			this.$el.show();
		},

		hide: function() {
			this.$el.hide();
		}
	});

	return MeasuringTapeView;
});
