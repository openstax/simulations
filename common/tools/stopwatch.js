define(function (require) {

	'use strict';

	var _ = require('underscore');

	var selectText = require('../dom/select-text');
	var Draggable = require('./draggable');

	var html  = require('text!./stopwatch.html');

	require('less!./stopwatch');

	var dx,
	    dy,
	    translate;

	var StopwatchView = Draggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'stopwatch-view',

		events: {
			'mousedown' : 'panelDown',
			'touchstart': 'panelDown',

			'click .stopwatch-toggle-btn' : 'toggleClicked',
			'click .stopwatch-reset-btn'  : 'resetClicked',

			'click .stopwatch-label-value': 'labelClicked'
		},

		initialize: function(options) {
			options = _.extend({
				position: {
					x: 30,
					y: 30
				},
				captureOnBody: false,
				mouseLeaveCancels: true,
				units : 'sec',
				decimals : 2,
				unitRatio : 1
			}, options);

			Draggable.prototype.initialize.apply(this, [options]);

			this.position = options.position;

			this.units = options.units;
			this.unitRatio = options.unitRatio;
			this.decimals = options.decimals;

			this.timing = false;
		},

		render: function() {
			this.renderStopwatch();
			this.bindDragEvents();
			this.resize();
			this.reset();
			this.update(0, 0);
		},

		renderStopwatch: function() {
			this.$el.html(this.template());
			this.$labelValue = this.$('.stopwatch-label-value');
			this.$toggleButtonText = this.$('.stopwatch-toggle-btn .btn-text');
			this.$('.stopwatch-label-units').text(this.units);
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

		toggleClicked: function(event) {
			this.timing = !this.timing;
			if (this.timing)
				this.$toggleButtonText.text('Stop');
			else
				this.$toggleButtonText.text('Start');
		},

		resetClicked: function(event) {
			this.reset();
		},

		labelClicked: function(event) {
			selectText(this.$labelValue[0]);
		},

		reset: function() {
			this.time = 0;
			this.$labelValue.text(this.time.toFixed(this.decimals));
		},

		stop: function() {
			this.timing = false;
		},

		setPosition: function(x, y) {
			this.position.x = x;
			this.position.y = y;
			this.updateOnNextFrame = true;
		},

		update: function(time, delta, paused, timeScale) {

			timeScale = timeScale || 1;

			if (this.timing && !paused) {
				this.time += delta * this.unitRatio;
				var scaledTime = this.time * timeScale;
				this.$labelValue.text(scaledTime.toFixed(this.decimals));
			}

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

	return StopwatchView;
});
