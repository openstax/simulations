define(function (require) {

	'use strict';

	// var $ = require('jquery');
	var _ = require('underscore');

	var SimDraggable = require('views/sim-draggable');

	var html = require('text!templates/moving-man.html');

	require('less!styles/moving-man');

	/**
	 *
	 */
	var MovingManView = SimDraggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'moving-man-view',

		events: {
			'mousedown  .moving-man-view' : 'down',
			'touchstart .moving-man-view' : 'down'
		},

		initialize: function(options) {
			SimDraggable.prototype.initialize.apply(this, [options]);

			this.simulation = options.simulation;
			this.movingMan = this.simulation.movingMan;
		},

		render: function() {
			this.renderMovingMan();
			this.bindDragEvents();
			this.resize();
			this.update(0, 0);
		},

		renderMovingMan: function() {
			this.$el.html(this.template());
		},

		down: function(event) {
			event.preventDefault();

			this.$el.addClass('dragging');

			this.dragging = true;

			this.fixTouchEvents(event);

			this.dragX = event.pageX;
		},

		drag: function(event) {
			if (this.dragging) {

				this.fixTouchEvents(event);

				// dx = event.pageX - this.dragX;

				// if (!this.outOfBounds(this.start.x + dx, this.start.y + dy) &&
				// 	!this.outOfBounds(this.end.x   + dx, this.end.y   + dy)) {

				// 	this.movingMan.x += dx;
				// }

				this.dragX = event.pageX;

				this.updateOnNextFrame = true;
			}
		},

		dragEnd: function(event) {
			if (this.dragging) {
				this.dragging = false;
				this.$el.removeClass('dragging');
			}
		},

		update: function(time, delta) {
			// If there aren't any changes, don't do anything.
			if (!this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			// this._translate = 'translateX(' + startX + 'px) translateY(' + startY + 'px)';

			// this.$el.css({
			// 	'-webkit-transform': this._translate,
			// 	'-ms-transform':     this._translate,
			// 	'-o-transform':      this._translate,
			// 	'transform':         this._translate,
			// });
		}
	});

	return MovingManView;
});
