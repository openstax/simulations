define(function (require) {

	'use strict';

	// var $ = require('jquery');
	var _ = require('underscore');

	var SimDraggable = require('views/sim-draggable');

	var html = require('text!templates/moving-man.html');

	require('less!styles/moving-man');

	/**
	 * Constants
	 */
	var MOVEMENT_STATE_IDLE  = 0;
	var MOVEMENT_STATE_LEFT  = 1;
	var MOVEMENT_STATE_RIGHT = 2;

	/**
	 *
	 */
	var MovingManView = SimDraggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'moving-man-view',

		events: {
			'mousedown'  : 'down',
			'touchstart' : 'down'
		},

		initialize: function(options) {
			SimDraggable.prototype.initialize.apply(this, [options]);

			this.simulation = options.simulation;
			this.movingMan  = this.simulation.movingMan;
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

			this.dragging = true;
			this.$el.addClass('dragging');

			this.fixTouchEvents(event);

			this.dragX = event.pageX;
		},

		drag: function(event) {
			if (this.dragging) {

				this.fixTouchEvents(event);

				// Get position
				this._xPercent = (event.pageX - this.dragOffset.left) / this.dragBounds.width;
				this._xPosition = (this._xPercent * this.simulation.get('containerWidth')) - this.simulation.get('halfContainerWidth');

				this.movingMan.addMouseData(this._xPosition);

				// Get direction
				if ((event.pageX - this.dragX) > 0)
					this.movementState = MOVEMENT_STATE_RIGHT;
				else
					this.movementState = MOVEMENT_STATE_LEFT;
				this.dragX = event.pageX;

				this.updateOnNextFrame = true;
			}
		},

		dragEnd: function(event) {
			if (this.dragging) {
				this.dragging = false;
				this.$el.removeClass('dragging');

				this.movementState = MOVEMENT_STATE_IDLE;

				this.updateOnNextFrame = true;
			}
		},

		update: function(time, delta) {
			// If there aren't any changes, don't do anything.
			if (!this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			// Update position
			this._xPercent  = (this.movingMan.get('position') + this.simulation.get('halfContainerWidth')) / this.simulation.get('containerWidth');
			this._xPixels   = this._xPercent * this.dragBounds.width;
			this._translate = 'translateX(' + this._xPixels + 'px)';

			this.$el.css({
				'-webkit-transform': this._translate,
				'-ms-transform':     this._translate,
				'-o-transform':      this._translate,
				'transform':         this._translate,
			});

			// Update direction
			if (this.visibleMovementState !== this.movementState) {
				this.visibleMovementState = this.movementState;

				switch (this.movementState) {
					case MOVEMENT_STATE_IDLE:
						this.$el
							.removeClass('left')
							.removeClass('right');
						break;
					case MOVEMENT_STATE_RIGHT:
						this.$el
							.removeClass('left')
							.addClass('right');
						break;
					case MOVEMENT_STATE_LEFT:
						this.$el
							.removeClass('right')
							.addClass('left');
						break;
				}
			}
		}
	});

	return MovingManView;
});
