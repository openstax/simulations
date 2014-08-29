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
	    position;

	var SegmentPotentialView = Backbone.View.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'segment-view',

		events: {
			'mousedown  .segment-handle' : 'handleDown',
			//'mouseup    .segment-handle' : 'handleUp',
			'touchstart .segment-handle' : 'handleDown',
			//'touchend   .segment-handle' : 'handleUp'
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
				.bind('mousemove touchmove', _.bind(this.handleMove, this))
				.bind('mouseup touchend',    _.bind(this.handleUp, this));
		},

		handleDown: function(event) {
			event.preventDefault();

			if ($(event.target).index() === 0)
				this.draggingStart = true;
			else
				this.draggingEnd = true;
		},

		handleMove: function(event) {
			if (this.draggingStart || this.draggingEnd) {
				x = event.pageX - this.dragOffset.left;
				y = event.pageY - this.dragOffset.top;

				xSpacing = this.heatmapView.xSpacing;
				ySpacing = this.heatmapView.ySpacing;

				// position = data.getLocalPosition(this.heatmapView.stage);
				x = (x - (xSpacing / 2.0)) / xSpacing;
				y = this.heatmapView.waveSimulation.lattice.height - (y - (ySpacing / 2.0)) / ySpacing;

				if (this.draggingStart) {
					this.segment.start.x = x;
					this.segment.start.y = y;
				}
				if (this.draggingEnd) {
					this.segment.end.x = x;
					this.segment.end.y = y;
				}

				this.resizeOnNextUpdate = true;
			}
		},

		handleUp: function(event) {
			this.draggingStart = false;
			this.draggingEnd   = false;
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
				width: lineLength,
				height: segment.thickness * xSpacing,
				transform: 'translateX(' + startX + 'px) translateY(' + startY + 'px) rotateZ(' + (-angle) + 'deg)'
			});
			
			// Make sure the handles are circles
			this.$('.segment-handle').width(this.$('.segment-handle').height());
		},

		handleStyle: function(handle) {
			handle.beginFill(0x21366B, 1);
			handle.lineStyle(1, 0x21366B, 0.5);
		},

	});

	return SegmentPotentialView;
});
