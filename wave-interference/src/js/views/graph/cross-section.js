define(function(require) {

	'use strict';

	var GraphView       = require('../graph');
	var StaticGraphView = require('./static');

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
	 * CrossSectionGraphView shows the values of a certain row of the
	 *   lattice in real time in the form of a curve.
	 */
	var CrossSectionGraphView = StaticGraphView.extend({

		className: 'cross-section-graph-view open initial',

		initialize: function(options) {
			StaticGraphView.prototype.initialize.apply(this, [options]);

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'CrossSectionGraphView requires a HeatmapView instance to render.';

			// Ratio between pixels and cell width
			this.xSpacing = 1;
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
			this.xSpacing = this.width / (this.waveSimulation.lattice.width - 1);
		},

		/**
		 * Initializes points array and sets default points.  The number
		 *   of points is based on the lattice width.
		 */
		initPoints: function() {
			this.points = [];

			length = this.waveSimulation.lattice.width;
			points = this.points;
			for (i = 0; i < length; i++) {
				points[i] = { 
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
			height   = this.height;
			xSpacing = this.xSpacing;

			lat = this.waveSimulation.lattice.data;

			latWidth  = this.waveSimulation.lattice.width;
			latHeight = this.waveSimulation.lattice.height;

			// Set row to where the cross section line is closest to
			j = parseInt(this.waveSimulation.get('crossSectionY') * this.waveSimulation.heightRatio);
			if (j > latHeight - 1)
				j = latHeight - 1;
			
			length = this.portrait ? latHeight : latWidth;
			for (i = 0; i < length; i++) {
				points[i].x = i * xSpacing;
				points[i].y = ((lat[i][j] - 2) / -4) * height;
			}

			// Hide the beginning
			points[0].x = -1;
		},

		/**
		 * Change the canvas border to give the user feedback.
		 *   This is called when the user starts sliding the
		 *   cross section slider to show that changing its
		 *   position affects what is rendered in this view.
		 */
		startChanging: function() {
			if (this.$canvas) {
				this.changing = true;
				this.$canvasWrapper.addClass('changing');
			}
		},

		/**
		 * Sets the border back to normal.
		 */
		stopChanging: function() {
			if (this.$canvas) {
				this.changing = false;
				this.$canvasWrapper.removeClass('changing');
			}
		},

		show: function(event) {
			StaticGraphView.prototype.show.apply(this, [event]);

			this.heatmapView.showCrossSectionSlider();
		},

		hide: function() {
			StaticGraphView.prototype.hide.apply(this);

			this.heatmapView.hideCrossSectionSlider();
		}

	});

	return CrossSectionGraphView;
});
