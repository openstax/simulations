define(function (require) {

	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	var HeatmapDraggable = require('./heatmap-draggable');

	var Utils = require('../utils/utils');
	var html  = require('text!../../templates/segment.html');

	var segment,
	    xSpacing,
	    ySpacing,
	    halfYSpacing,
	    halfXSpacing,
	    padding,
	    height,
	    angle,
	    lineLength,
	    startX,
	    startY,
	    dx,
	    dy,
	    transform,
	    transformOrigin;

	var SegmentPotentialView = HeatmapDraggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'segment-view',

		events: {
			'mousedown  .segment-handle' : 'handleDown',
			'touchstart .segment-handle' : 'handleDown',
			'mousedown' : 'boxDown',
			'touchstart': 'boxDown'
		},

		initialize: function(options) {
			HeatmapDraggable.prototype.initialize.apply(this, [options]);

			if (options.segment)
				this.segment = options.segment;
			else
				throw 'SegmentPotentialView requires a Barrier model.';
		},

		render: function() {
			this.renderBox();
			this.bindDragEvents();
			this.resize();
			this.update(0, 0);
		},

		renderBox: function() {
			this.$el.html(this.template());
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

			$(event.target).addClass('active');
		},

		boxDown: function(event) {
			if (event.target === this.el) {
				event.preventDefault();

				this.$el.addClass('active');

				this.draggingBox = true;

				this.fixTouchEvents(event);

				this.dragX = event.pageX;
				this.dragY = event.pageY;
			}
		},

		drag: function(event) {
			if (this.draggingStart || this.draggingEnd) {

				this.fixTouchEvents(event);

				dx = this.toLatticeXScale(event.pageX - this.dragX);
				dy = this.toLatticeYScale(event.pageY - this.dragY);

				segment = this.segment;

				if (!this.wayOutOfBounds(event.pageX, event.pageY)) {
					if (this.draggingStart && this.heatmapView.isVisiblePoint(segment.start.x + dx, segment.start.y + dy)) {
						segment.start.x += dx;
						segment.start.y += dy;
					}
					if (this.draggingEnd && this.heatmapView.isVisiblePoint(segment.end.x + dx, segment.end.y + dy)) {
						segment.end.x += dx;
						segment.end.y += dy;
					}
				}
				else
					this.dragEnd();

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
			else if (this.draggingBox) {

				this.fixTouchEvents(event);

				dx = this.toLatticeXScale(event.pageX - this.dragX);
				dy = this.toLatticeYScale(event.pageY - this.dragY);

				segment = this.segment;

				if (!this.wayOutOfBounds(event.pageX, event.pageY)) {
					if (this.heatmapView.isVisiblePoint(segment.start.x + dx, segment.start.y + dy) &&
						this.heatmapView.isVisiblePoint(segment.end.x   + dx, segment.end.y   + dy)) {

						segment.start.x += dx;
						segment.start.y += dy;
						segment.end.x += dx;
						segment.end.y += dy;
					}
				}
				else
					this.dragEnd();

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
		},

		dragEnd: function(event) {
			if (this.draggingStart || this.draggingEnd) {
				this.draggingStart = false;
				this.draggingEnd   = false;
				this.$('.segment-handle').removeClass('active');
			}
			else if (this.draggingBox) {
				this.draggingBox = false;
				this.$el.removeClass('active');
			}
		},

		update: function(time, delta) {
			segment = this.segment;

			if (!segment.enabled)
				return;

			// If there aren't any changes, don't do anything.
			if (!this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			height = this.waveSimulation.lattice.height;

			xSpacing = this.heatmapView.xSpacing / this.zoom;
			ySpacing = this.heatmapView.ySpacing / this.zoom;
			halfYSpacing = ySpacing / 2.0;
			halfXSpacing = xSpacing / 2.0;

			padding = (segment.thickness / 2) * ySpacing;

			angle = segment.getAngle();

			lineLength = Utils.lineLength(
				segment.start.x * xSpacing, 
				segment.start.y * ySpacing, 
				segment.end.x * xSpacing, 
				segment.end.y * ySpacing
			);

			startX = segment.start.x * xSpacing - halfXSpacing;
			startY = (height - segment.start.y) * ySpacing - halfYSpacing - padding;

			transform = 'translateX(' + startX + 'px) translateY(' + startY + 'px) rotateZ(' + (-angle) + 'deg)';
			transformOrigin = padding + 'px center';

			// Set the width so it spans the two points
			this.$el.css({
				width: lineLength + segment.thickness * xSpacing,
				height: segment.thickness * xSpacing,

				'-webkit-transform': transform,
				'-ms-transform': transform,
				'-o-transform': transform,
				'transform': transform,

				'-webkit-transform-origin': transformOrigin,
				'-moz-transform-origin': transformOrigin,
				'-ms-transform-origin': transformOrigin,
				'transform-origin': transformOrigin,
			});
			
			// Make sure the handles are circles
			this.$('.segment-handle').width(this.$('.segment-handle').height());
		}
	});

	return SegmentPotentialView;
});
