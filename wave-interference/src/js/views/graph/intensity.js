define(function(require) {

	'use strict';

	var _ = require('lodash');

	var StaticGraphView = require('./static.js');

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var length,
		width,
		ySpacing,
		points,
		intensity,
		colors,
	    j;

	/**
	 * IntensityGraphView shows on a line graph intensity of colors 
	 *   reaching the right edge of the heatmap. 
	 */
	var IntensityGraphView = StaticGraphView.extend({

		className: 'intensity-graph-view open initial',

		initialize: function(options) {

			options = _.extend({
				title: 'Intensity',
				showButtonText: 'Show Intensity Graph',
				x: {
					start: 0,
					end: 1,
					step: 0.5,
					label: 'intensity',
					showNumbers: true
				},
				y: {
					start: 0,
					end: 1.05,
					step: 0.05,
					label: 'position',
					showNumbers: true
				},
				portrait: true,
				longitudinalGridLines: 1,
				latitudinalGridLines: 21
			}, options);

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'IntensityGraphView requires a HeatmapView instance to render.';

			if (options.screenGraphView)
				this.screenGraphView = options.screenGraphView;
			else
				throw 'IntensityGraphView requires a ScreenGraphView instance to render.';

			StaticGraphView.prototype.initialize.apply(this, [options]);

			// Ratio between pixels and cell width
			this.ySpacing = 1;
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
		 *  our cached xSpacing whenever the canvas size changes.
		 */
		resize: function() {
			StaticGraphView.prototype.resize.apply(this);
			this.ySpacing = this.height / (this.waveSimulation.lattice.height - 1);
		},

		/**
		 *
		 */
		postRender: function() {
			StaticGraphView.prototype.postRender.apply(this);
		},

		/**
		 * Initializes points array and sets default points.  The number
		 *   of points is based on the lattice height (colors length).
		 */
		initPoints: function() {
			this.points = [];

			length = this.screenGraphView.colors.length;
			points = this.points;
			for (j = 0; j < length; j++) {
				points[j] = { 
					x: 0, 
					y: 0 
				};
			}
		},

		/**
		 * Calculates point data before drawing.
		 */
		calculatePoints: function() {
			points   = this.points;
			width    = this.width;
			ySpacing = this.ySpacing;

			colors = this.screenGraphView.colors;
			length = this.screenGraphView.colors.length;

			for (j = 0; j < length; j++) {
				intensity = this.colorToMagnitude(colors[j]) / 255;
				points[j].x = intensity * width;
				points[j].y = j * ySpacing;
			}
			// Hide the beginning
			points[0].y = -1;
		},

		/**
		 * I looked at PhET's ColorVector.getMagnitude and realized they
		 *   made a mistake and returned the Math.abs of the sum of the
		 *   parts squared instead of the sqrt.  I know it's a mistake
		 *   because the sum of the squares is already guaranteed to be
		 *   positive...
		 */
		colorToMagnitude: function(rgb) {
			return Math.sqrt(rgb.r * rgb.r + rgb.g * rgb.g + rgb.b * rgb.b);
		},


		show: function(event) {
			if (this.toggling)
				return;

			StaticGraphView.prototype.show.apply(this, [event]);

			this.heatmapView.shift();
		},

		hide: function(event) {
			if (this.toggling)
				return;
			
			StaticGraphView.prototype.hide.apply(this, [event]);

			this.heatmapView.unshift();
		},

	});

	return IntensityGraphView;
});
