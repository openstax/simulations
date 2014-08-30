define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');
	var PIXI     = require('pixi');
	var Utils    = require('utils/utils');
	var html     = require('text!templates/segment.html');

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
	    i,
	    j,
	    x,
	    y,
	    dx,
	    dy,
	    position;

	var SegmentPotentialView = Backbone.View.extend({

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

			// Default values
			options = _.extend({
				
			}, options);

			if (options.segment)
				this.segment = options.segment;
			else
				throw 'SegmentPotentialView requires a Barrier model.';

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'SegmentPotentialView requires a HeatmapView to render.';

			this.listenTo(this.heatmapView, 'resize', function(){
				this.resizeOnNextUpdate = true;
				this.dragOffset = this.$dragFrame.offset();
				this.dragBounds = {
					width:  this.$dragFrame.width(),
					height: this.$dragFrame.height()
				};
			});
		},

		render: function() {
			this.renderBox();
			
			this.update(0, 0);
		},

		renderBox: function() {
			this.$el.html(this.template());

			this.$dragFrame = this.heatmapView.$('.potential-views');
			this.$dragFrame
				.bind('mousemove touchmove', _.bind(this.drag, this))
				.bind('mouseup touchend',    _.bind(this.dragEnd, this));
		},

		handleDown: function(event) {
			event.preventDefault();

			if ($(event.target).index() === 0)
				this.draggingStart = true;
			else
				this.draggingEnd = true;

			$(event.target).addClass('active');
		},

		boxDown: function(event) {
			if (event.target === this.el) {
				event.preventDefault();
				this.$el.addClass('active');
				this.draggingBox = true;
				this.dragX = event.pageX;
				this.dragY = event.pageY;
			}
		},

		drag: function(event) {
			if (this.draggingStart || this.draggingEnd) {

				// if (this.outOfBounds(event.pageX, event.pageY))
				// 	this.dragEnd();

				x = event.pageX - this.dragOffset.left;
				y = event.pageY - this.dragOffset.top;

				xSpacing = this.heatmapView.xSpacing;
				ySpacing = this.heatmapView.ySpacing;

				// position = data.getLocalPosition(this.heatmapView.stage);
				x = (x - (xSpacing / 2.0)) / xSpacing;
				y = this.heatmapView.waveSimulation.lattice.height - (y - (ySpacing / 2.0)) / ySpacing;

				segment = this.segment;

				if (!this.outOfBounds(event.pageX, event.pageY) && 
					this.heatmapView.waveSimulation.isValidPoint(x, y)) {

					if (this.draggingStart) {
						segment.start.x = x;
						segment.start.y = y;
					}
					if (this.draggingEnd) {
						segment.end.x = x;
						segment.end.y = y;
					}	
				}

				this.resizeOnNextUpdate = true;
			}
			else if (this.draggingBox) {

				// if (this.outOfBounds(event.pageX, event.pageY))
				// 	this.dragEnd();

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				// Convert to lattice space
				dx = dx / this.heatmapView.xSpacing;
				dy = dy / this.heatmapView.ySpacing * -1;

				segment = this.segment;

				if (!this.outOfBounds(event.pageX, event.pageY) &&
					this.heatmapView.waveSimulation.isValidPoint(segment.start.x + dx, segment.start.y + dy) &&
					this.heatmapView.waveSimulation.isValidPoint(segment.end.x   + dx, segment.end.y   + dy)) {

					segment.start.x += dx;
					segment.start.y += dy;
					segment.end.x += dx;
					segment.end.y += dy;
				}

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.resizeOnNextUpdate = true;
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
			if (!this.resizeOnNextUpdate)
				return;

			this.resizeOnNextUpdate = false;

			height = this.heatmapView.waveSimulation.lattice.height;

			xSpacing = this.heatmapView.xSpacing;
			ySpacing = this.heatmapView.ySpacing;
			halfYSpacing = ySpacing / 2.0;
			halfXSpacing = xSpacing / 2.0;

			padding = (segment.thickness / 2) * ySpacing;

			angle = segment.getAngle();
			console.log(angle);

			lineLength = Utils.lineLength(
				segment.start.x * xSpacing, 
				segment.start.y * ySpacing, 
				segment.end.x * xSpacing, 
				segment.end.y * ySpacing
			);

			startX = segment.start.x * xSpacing - halfXSpacing;
			startY = (height - segment.start.y) * ySpacing - halfYSpacing - padding;

			// Set the width so it spans the two points
			this.$el.css({
				width: lineLength + segment.thickness * xSpacing,
				height: segment.thickness * xSpacing,
				transform: 'translateX(' + startX + 'px) translateY(' + startY + 'px) rotateZ(' + (-angle) + 'deg)'
			});
			
			// Make sure the handles are circles
			this.$('.segment-handle').width(this.$('.segment-handle').height());
		},

		outOfBounds: function(x, y) {
			return (x > this.dragOffset.left + this.dragBounds.width  || x < this.dragOffset.left ||
				    y > this.dragOffset.top  + this.dragBounds.height || y < this.dragOffset.top);
		}

	});

	return SegmentPotentialView;
});
