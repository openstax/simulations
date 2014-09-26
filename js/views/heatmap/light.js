define(function(require) {

	'use strict';

	var _ = require('underscore');

	var Utils            = require('utils/utils');
	var HeatmapView      = require('views/heatmap');
	var ScreenGraphView  = require('views/graph/screen');
	

	require('utils/jquery-plugins');

	/*
	 * Constants
	 */
	var EPSILON = 0.025; // A magic number from PhET's PhotonEmissionColorMap.getColor

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var lattice,
	    intensityAlpha;

	/**
	 * 
	 */
	var LightHeatmapView = HeatmapView.extend({

		initialize: function(options) {
			// Default values
			options = _.extend({
				title: 'Electric Field &ndash; XZ-Plane',
				color: '#f00',
				brightness: 0.45
			}, options);

			HeatmapView.prototype.initialize.apply(this, [ options ]);

			this.initScreenGraphView();

			this.cellChecked = [];
			for (var i = 0; i < this.waveSimulation.lattice.width; i++) {
				this.cellChecked[i] = [];
				for (var j = 0; j < this.waveSimulation.lattice.height; j++) {
					this.cellChecked[i].push(false);
				}
			}

			this.listenTo(this.waveSimulation.darkWaveSimulation, 'set-dark', this.setDark);
			this.listenTo(this.waveSimulation, 'reset', this.resetDarkness);
			this.listenTo(this.waveSimulation, 'reset', this.changeColor);
		},

		/**
		 * Initializes the ScreenGraphView.
		 */
		initScreenGraphView: function() {
			this.screenGraphView = new ScreenGraphView({
				waveSimulation: this.waveSimulation,
				heatmapView: this
			});
		},

		/**
		 *
		 */
		render: function() {
			HeatmapView.prototype.render.apply(this);

			this.renderScreenGraphView();
		},

		/**
		 * Renders the graph view
		 */
		renderScreenGraphView: function() {
			this.screenGraphView.render();
			this.$el.prepend(this.screenGraphView.el);
		},

		/**
		 *
		 */
		postRender: function() {
			HeatmapView.prototype.postRender.apply(this);

			this.screenGraphView.postRender();
		},

		/**
		 * Makes it so a value of false returns an alpha of 0, making
		 *   the particle invisible.
		 */
		alphaFromCellValue: function(value, x, y) {
			if (Math.abs(value) < EPSILON && !this.cellChecked[x][y]) {
				return 0;
			}
			else {
				this.cellChecked[x][y] = true;
				return HeatmapView.prototype.alphaFromCellValue.apply(this, [value, x, y]);
			}			
		},

		/**
		 * Makes it so the alphaFromCellValue function will have to
		 *   re-check for darkness.
		 */
		setDark: function(x, y) {
			this.cellChecked[x][y] = false;
		},

		/**
		 *
		 */
		resetDarkness: function() {
			for (var i = 0; i < this.waveSimulation.lattice.width; i++) {
				for (var j = 0; j < this.waveSimulation.lattice.height; j++) {
					this.setDark(i, j);
				}
			}
		},

		/**
		 * Gets all the average colors on the right edge by taking the 
		 *   particle color and multiplying it by the alpha derrived 
		 *   from the average of each lattice value along the edge.  
		 *   Stores it in the [out] array given.
		 */
		getAvgEdgeColors: function(out) {
			lattice = this.waveSimulation.lattice;
			var i = lattice.width - 1;
			for (var j = 0; j < lattice.height; j++) {
				intensityAlpha = Math.abs(lattice.avg(i, lattice.height - j, 2));
				if (intensityAlpha > 1)
					intensityAlpha = 1;
				out[j] = Utils.toRgba(this.color, intensityAlpha, true);
			}
		},

		/**
		 *
		 */
		update: function(time, delta) {
			if (!this.waveSimulation.paused) {
				this.screenGraphView.update(time, delta);
			}

			HeatmapView.prototype.update.apply(this, [time, delta]);
		},

		/**
		 *
		 */
		enableScreenMode: function() {
			this.$container.addClass('rotated');

			if (this.shifted)
				this.$el.addClass('shifted');
		},

		/**
		 *
		 */
		disableScreenMode: function() {
			this.$container.removeClass('rotated');

			if (this.shifted)
				this.$el.removeClass('shifted');
		},

		/**
		 *
		 */
		shift: function() {
			this.$el.addClass('shifted');
			this.shifted = true;
		},

		/**
		 *
		 */
		unshift: function() {
			this.$el.removeClass('shifted');
			this.shifted = false;
		},

		/**
		 * Changes the color of the particles
		 */
		changeColor: function() {
			var width  = this.waveSimulation.lattice.width;
			var height = this.waveSimulation.lattice.height;

			var xSpacing = this.xSpacing;
			var ySpacing = this.ySpacing;

			var particles = this.particles;

			var texture = this.generateParticleTexture(Math.max(xSpacing, ySpacing) * 2);
			var i, j;

			for (i = 0; i < width; i++) {
				for (j = 0; j < height; j++) {
					particles[i][j].setTexture(texture);
				}
			}
		},

	});

	return LightHeatmapView;
});
