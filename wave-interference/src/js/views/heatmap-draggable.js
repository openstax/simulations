define(function (require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone'); Backbone.$ = $;

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

			this.zoom = parseFloat($('.heatmap-column').css('zoom'));

			this.outerDragOffset = this.$outerDragFrame.offset();
			this.outerDragOffset.top  *= this.zoom;
			this.outerDragOffset.left *= this.zoom;

			this.outerDragBounds = {
				width:  this.$outerDragFrame.width()  * this.zoom,
				height: this.$outerDragFrame.height() * this.zoom 
			};

			this.dragOffset = this.$dragFrame.offset();
			this.dragOffset.top  *= this.zoom;
			this.dragOffset.left *= this.zoom;

			this.dragBounds = {
				width:  this.$dragFrame.width()  * this.zoom,
				height: this.$dragFrame.height() * this.zoom
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
