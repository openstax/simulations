define(function(require) {

	'use strict';

	var GraphView = require('common/graph/graph');

	/**
	 * MovingManGraphView shows the value of a given moving-man variable
	 *   over time (e.g., position, velocity, or acceleration over time).
	 */
	var MovingManGraphView = GraphView.extend({

		className: GraphView.prototype.className + ' moving-man-graph-view',

		/**
		 * Internal fields
		 */
		pixelRatioX: 1, 
		pixelRatioY: 1,

		/**
		 * Object initialization
		 */
		initialize: function(options) {
			if (options.graphSeries)
				this.graphSeries = options.graphSeries;
			else
				throw 'MovingManGraphView requires a graph series object to render.';

			this.timeSpan  = options.timeSpan || 20;
			this.valueSpan = Math.abs(options.y.end - options.y.start);

			GraphView.prototype.initialize.apply(this, [options]);
		},

		/**
		 * Renders html container
		 */
		renderContainer: function() {
			this.$el.html(this.template(this.graphInfo));

			this.$showButton = this.$('.graph-show-button');
			this.$hideButton = this.$('.graph-hide-button');
		},

		/**
		 * Does the actual resizing of the canvas. We need to also update
		 *  our cached pixel ratio.
		 */
		resize: function() {
			GraphView.prototype.resize.apply(this);
			this.pixelRatioX = this.width / this.timeSpan;
			this.pixelRatioY = this.height / this.valueSpan;
		},

		/**
		 * Initializes points array and sets default points.  The number
		 *   of points is based on the lattice width.
		 */
		initPoints: function() {
			this.points = [];
		},

		/**
		 * Calculates point data before drawing.
		 */
		calculatePoints: function() {
			var points      = this.points;
			var height      = this.height;
			var pixelRatioX = this.pixelRatioX;
			var pixelRatioY = this.pixelRatioY;
			var graphSeries = this.graphSeries;
			var length      = graphSeries.size();
			
			for (i = 0; i < length; i++) {
				if (i >= points.length)
					this.addPoint();

				points[i].x = graphSeries.getPoint(i).time  * pixelRatioX;
				points[i].y = this.height / 2 - graphSeries.getPoint(i).value * pixelRatioY;
			}

			// Hide the beginning
			if (length)
				points[0].x = -1;
		},

		/**
		 *
		 */
		addPoint: function() {
			this.points.push({ 
				x: 0, 
				y: 0 
			});
		},

	});

	return MovingManGraphView;
});
