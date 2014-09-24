define(function(require) {

	'use strict';

	var GraphView       = require('views/graph');
	var StaticGraphView = require('views/graph/static');

	var html = require('text!templates/screen-graph.html');

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
	 * ScreenGraphView shows the values of a certain row of the
	 *   lattice in real time in the form of a curve.
	 */
	var ScreenGraphView = StaticGraphView.extend({

		template: _.template(html),
		className: 'screen-graph-view',

		events: {
			'click .screen-graph-show-button' : 'show',
			'click .screen-graph-hide-button' : 'hide'
		},

		initialize: function(options) {
			// Default values
			options = _.extend({
				title: 'Screen',
				x: null,
				y: null,
				latitudinalGridLines: 0,
				longitudinalGridLines: 0
			}, options);

			StaticGraphView.prototype.initialize.apply(this, [options]);

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'ScreenGraphView requires a HeatmapView instance to render.';

			// Ratio between pixels and cell width
			this.xSpacing = 1;

			// History of colors along the edge of the heatmap
			this.colorHistory = [];
			this.colorHistoryIndex = 0;
			this.colorHistoryLength = 120;

			// Initialize each record in the color history as an array of points
			for (var h = 0; h < this.colorHistoryLength; h++) {
				this.colorHistory[h] = [];
				for (var j = 0; j < this.waveSimulation.lattice.height; j++) {
					this.colorHistory[h].push({
						r: 0,
						g: 0,
						b: 0
					});
				}
			}

			// 
			this.intensityScale = 7;

			// A place to store the colors
			this.colors = [];
				
		},

		/**
		 * Renders html container
		 */
		renderContainer: function() {
			this.$el.html(this.template(this.graphInfo));

			this.$showButton = this.$('.screen-graph-show-button');
			this.$hideButton = this.$('.screen-graph-hide-button');

			this.$showChartButton = this.$('.screen-graph-show-chart-button');
			//this.$hideButton = this.$('.screen-graph-hide-button');
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
		 * 
		 */
		initPoints: function() {},

		/**
		 * 
		 */
		drawColors: function() {

		},

		/**
		 * 
		 */
		updateColorHistory: function() {
			this.heatmapView.getEdgeColors(this.colorHistory[this.colorHistoryIndex++]);

			if (this.colorHistoryIndex == this.colorHistoryLength)
				this.colorHistoryIndex = 0;

			var height = this.waveSimulation.lattice.height;
			var r, 
			    g, 
			    b;

			for (var j = 0; j < height; j++) {
				r = 0; 
				g = 0; 
				b = 0;
				for (var h = 0; h < this.colorHistoryLength; h++) {
					r += this.colorHistory[h].r;
					g += this.colorHistory[h].g;
					b += this.colorHistory[h].b;
				}
				this.colors[j] = Utils.rgbToHex(r, g, b);
			}
		},

		/**
		 * Responds to resize events and draws everything.
		 */
		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			if (this.graphVisible) {
				this.updateColorHistory();
				this.drawColors();
			}
		}


		show: function(event) {
			if (this.toggling)
				return;

			StaticGraphView.prototype.show.apply(this, [event]);

			this.heatmapView.enableScreenMode();
			this.$showChartButton.addClass('visible');
		},

		hide: function(event) {
			if (this.toggling)
				return;
			
			StaticGraphView.prototype.hide.apply(this, [event]);

			this.heatmapView.disableScreenMode();
			this.$showChartButton.removeClass('visible');
		},

		animationDuration: function() {
			return 400;
		}
	});

	return ScreenGraphView;
});
