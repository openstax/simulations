define(function(require) {

	'use strict';

	var GraphView       = require('views/graph');
	var StaticGraphView = require('views/graph/static');

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var length,
	    lat,
		latWidth,
		latHeight,
		height,
		xSpacing,
		points,
	    i,
	    j;


	/**
	 * IntensityGraphView shows the values of a certain row of the
	 *   lattice in real time in the form of a curve.
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

			StaticGraphView.prototype.initialize.apply(this, [options]);

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'IntensityGraphView requires a HeatmapView instance to render.';

			if (options.screenGraphView)
				this.screenGraphView = options.screenGraphView;
			else
				throw 'IntensityGraphView requires a ScreenGraphView instance to render.';

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
			GraphView.prototype.resize.apply(this);
			this.ySpacing = this.height / (this.waveSimulation.lattice.height - 1);
		},

		/**
		 *
		 */
		postRender: function() {
			StaticGraphView.prototype.postRender.apply(this);
		},

		/**
		 * Calculates point data before drawing.
		 */
		calculatePoints: function() {
			// points   = this.points;
			// height   = this.height;
			// xSpacing = this.xSpacing;

			// lat = this.waveSimulation.lattice.data;

			// latWidth  = this.waveSimulation.lattice.width;
			// latHeight = this.waveSimulation.lattice.height;

			// // Set row to where the cross section line is closest to
			// j = parseInt(this.waveSimulation.get('crossSectionY') * this.waveSimulation.heightRatio);
			// if (j > latHeight - 1)
			// 	j = latHeight - 1;
			
			// length = this.portrait ? latHeight : latWidth;
			// for (i = 0; i < length; i++) {
			// 	points[i].x = i * xSpacing;
			// 	points[i].y = ((lat[i][j] - 2) / -4) * height;
			// }

			// // Hide the beginning
			// points[0].x = -1;
		},

	});

	return IntensityGraphView;
});
