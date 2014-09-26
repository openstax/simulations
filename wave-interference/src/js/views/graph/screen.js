define(function(require) {

	'use strict';

	var _     = require('underscore');
	var Utils = require('utils/utils');

	var GraphView          = require('views/graph');
	var StaticGraphView    = require('views/graph/static');
	var IntensityGraphView = require('views/graph/intensity');

	var html = require('text!templates/screen-graph.html');

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

			var j, h;

			// Initialize each record in the color history as an array of points
			for (h = 0; h < this.colorHistoryLength; h++) {
				this.colorHistory[h] = [];
				for (j = 0; j < this.waveSimulation.lattice.height; j++) {
					this.colorHistory[h].push({
						r: 0,
						g: 0,
						b: 0,
						a: 0
					});
				}
			}

			// 
			this.intensityScale = 7;

			// Initialize values for our colors array
			this.colors = [];
			for (j = 0; j < this.waveSimulation.lattice.height; j++) {
				this.colors[j] = {
					r: 0, 
					g: 0, 
					b: 0
				};
			}

			// For syncronizing with the simulation
			this.accumulator = 0;
			this.time = 0;
			this.timestep = this.waveSimulation.timestep;

			this.intensityGraphView = new IntensityGraphView({
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView,
				screenGraphView: this
			});
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

			this.intensityGraphView.render();
			this.$('.intensity-graph-placeholder').replaceWith(this.intensityGraphView.el);
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
		postRender: function() {
			this.intensityGraphView.postRender();

			StaticGraphView.prototype.postRender.apply(this);
		},


		/**
		 * 
		 */
		initPoints: function() {},

		/**
		 * Draws the colors in this.colors all the way down the canvas,
		 *   interpolating between colors.
		 */
		drawColors: function() {
			/*
			 * Get the ratio of lattice cells to pixels so we can figure
			 *   out which colors (directly correlating to lattice cell)
			 *   we're between at any given pixel (y).
			 */
			var ratio = this.height / this.waveSimulation.lattice.height;
			var width = this.width;

			var maxColorIndex = this.colors.length - 1;

			var a, // The starting color's index
			    b, // The ending color's index
			    progress, // Progress from the starting to ending color
			    colors  = this.colors,
			    context = this.context;

			for (var y = 0; y < this.height; y++) {
				a = Math.floor(y / ratio);
				b = a + 1;

				// Catch rounding errors with floats
				if (b > maxColorIndex) {
					b--;
					a--;
				}

				// The unrounded index minus the start index
				progress = (y / ratio) - a;

				/*
				 * Using our two colors and our progress between colors,
				 *   find the linearly interpolated color between them.
				 */
				context.fillStyle = Utils.rgbToHex(
					parseInt(Utils.lerp(colors[a].r, colors[b].r, progress)),
					parseInt(Utils.lerp(colors[a].g, colors[b].g, progress)),
					parseInt(Utils.lerp(colors[a].b, colors[b].b, progress))
				);
				context.fillRect(0, y, width, 1);
			}
		},

		/**
		 * 
		 */
		updateColorHistory: function() {
			this.heatmapView.getAvgEdgeColors(this.colorHistory[this.colorHistoryIndex++]);

			if (this.colorHistoryIndex == this.colorHistoryLength) {
				this.colorHistoryIndex = 0;
				this.colorHistoryFilled = true;
			}
		},

		/**
		 *
		 */
		calculateColors: function() {
			var scalar;
			if (!this.colorHistoryFilled)
				scalar = this.intensityScale / (this.colorHistoryIndex + 1);
			else
				scalar = this.intensityScale / this.colorHistoryLength;

			var colors = this.colors,
			    color;

			var height = this.waveSimulation.lattice.height;
			for (var j = 0; j < height; j++) {
				color = colors[j];
				color.r = 0; 
				color.g = 0; 
				color.b = 0;
				for (var h = 0; h < this.colorHistoryLength; h++) {
					color.r += this.colorHistory[h][j].r * this.colorHistory[h][j].a;
					color.g += this.colorHistory[h][j].g * this.colorHistory[h][j].a;
					color.b += this.colorHistory[h][j].b * this.colorHistory[h][j].a;
				}
				color.r *= scalar;
				color.g *= scalar;
				color.b *= scalar;
				color.r = Math.min(color.r, 255);
				color.g = Math.min(color.g, 255);
				color.b = Math.min(color.b, 255);
			}
		},

		/**
		 * Responds to resize events and draws everything.
		 */
		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			if (!this.paused) {
				this.accumulator += delta;

				while (this.accumulator >= this.timestep) {
					this.time += this.timestep;

					this._update(time, delta);
					
					this.accumulator -= this.timestep;
				}	
			}
		},

		_update: function(time, delta) {
			this.updateColorHistory();
			this.calculateColors();
			this.drawColors();
			this.intensityGraphView.update(time, delta);
		},

		show: function(event) {
			if (this.toggling)
				return;

			StaticGraphView.prototype.show.apply(this, [event]);

			this.heatmapView.enableScreenMode();
			this.intensityGraphView.$el.addClass('visible');
		},

		_afterShow: function() {
			StaticGraphView.prototype._afterShow.apply(this, [event]);

			this.intensityGraphView.resize();
		},

		hide: function(event) {
			if (this.toggling)
				return;
			
			StaticGraphView.prototype.hide.apply(this, [event]);

			this.heatmapView.disableScreenMode();
			this.intensityGraphView.$el.removeClass('visible');
		},

		animationDuration: function() {
			return 400;
		}
	});

	return ScreenGraphView;
});
