define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');

	var HeatmapDraggable = Backbone.View.extend({

		initialize: function(options) {

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'HeatmapDraggable requires a HeatmapView to render.';

			this.waveSimulation = this.heatmapView.waveSimulation;

			this.listenTo(this.heatmapView, 'resized', this.resize);
		},

		bindDragEvents: function() {
			this.$outerDragFrame = this.heatmapView.$el;
			this.$dragFrame      = this.heatmapView.$('.potential-views');

			this.$outerDragFrame
				.bind('mousemove touchmove', _.bind(this.drag, this))
				.bind('mouseup touchend',    _.bind(this.dragEnd, this))
				.bind('mouseleave',          _.bind(this.dragEnd, this));

			this.heatmapView.$('.cross-section-slider')
				.bind('mousemove touchmove', _.bind(this.drag, this))
				.bind('mouseup touchend', _.bind(this.dragEnd, this));
		},

		resize: function(){
			this.updateOnNextFrame = true;

			this.outerDragOffset = this.$outerDragFrame.offset();
			this.outerDragBounds = {
				width:  this.$outerDragFrame.width(),
				height: this.$outerDragFrame.height() 
			};

			this.dragOffset = this.$dragFrame.offset();
			this.dragBounds = {
				width:  this.$dragFrame.width(),
				height: this.$dragFrame.height()
			};
		},

		drag: function(event) {},

		dragEnd: function(event) {},

		fixTouchEvents: function(event) {
			if (event.pageX === undefined) {
				event.pageX = event.originalEvent.touches[0].pageX;
				event.pageY = event.originalEvent.touches[0].pageY;
			}
		},

		outOfBounds: function(x, y) {
			return (x > this.dragOffset.left + this.dragBounds.width  || x < this.dragOffset.left ||
				    y > this.dragOffset.top  + this.dragBounds.height || y < this.dragOffset.top);
		},

		wayOutOfBounds: function(x, y) {
			return (x > this.outerDragOffset.left + this.outerDragBounds.width  || x < this.outerDragOffset.left ||
				    y > this.outerDragOffset.top  + this.outerDragBounds.height || y < this.outerDragOffset.top);
		},

		toLatticeXScale: function(x) {
			return x / this.heatmapView.xSpacing;
		},

		toLatticeYScale: function(y) {
			return y / this.heatmapView.ySpacing * -1;
		}

	});

	return HeatmapDraggable;
});
