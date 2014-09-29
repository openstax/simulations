define(function (require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');

	var SimDraggable = Backbone.View.extend({

		initialize: function(options) {

			if (options.dragFrame)
				this.$dragFrame = $(options.dragFrame);
			else
				throw 'SimDraggable requires an element to be used as a drag frame.';

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'SimDraggable requires a HeatmapView to render.';

			this.waveSimulation = this.heatmapView.waveSimulation;

			this.visible = false;

			this.listenTo(this.heatmapView, 'resized', this.resize);
		},

		bindDragEvents: function() {
			this.$dragFrame
				.bind('mousemove touchmove', _.bind(this.drag,    this))
				.bind('mouseup touchend',    _.bind(this.dragEnd, this))
				.bind('mouseleave',          _.bind(this.dragEnd, this));
		},

		resize: function(){
			this.updateOnNextFrame = true;

			this.dragOffset = this.$dragFrame.offset();
			this.dragBounds = {
				width:  this.$dragFrame.width(),
				height: this.$dragFrame.height()
			};

			this.width  = this.$el.width();
			this.height = this.$el.height();
		},

		drag: function(event) {},

		dragEnd: function(event) {},

		fixTouchEvents: function(event) {
			if (event.pageX === undefined) {
				event.pageX = event.originalEvent.touches[0].pageX;
				event.pageY = event.originalEvent.touches[0].pageY;
			}
		},

		toSimXScale: function(x) {
			return (x / this.heatmapView.xSpacing) / this.waveSimulation.widthRatio;
		},

		toSimYScale: function(y) {
			return (y / this.heatmapView.ySpacing) / this.waveSimulation.heightRatio;
		},

		outOfBounds: function(x, y, dimensions) {
			if (dimensions) {
				return (x + dimensions.width  > this.dragBounds.width  || x < 0 ||
					    y + dimensions.height > this.dragBounds.height || y < 0);
			}
			else {
				return (x > this.dragBounds.width  || x < 0 ||
					    y > this.dragBounds.height || y < 0);	
			}
		},

		boxOutOfBounds: function(x, y) {
			return this.outOfBounds(x, y, this);
		},

		show: function() {
			this.$el.show();
			this.visible = true;
		},

		hide: function() {
			this.$el.hide();
			this.visible = false;
		}

	});

	return SimDraggable;
});
