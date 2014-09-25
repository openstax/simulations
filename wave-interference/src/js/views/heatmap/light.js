define(function(require) {

	'use strict';

	var _ = require('underscore');

	var HeatmapView = require('views/heatmap');
	var Utils       = require('utils/utils');

	require('utils/jquery-plugins');

	/*
	 * Constants
	 */
	var EPSILON = 0.025; // A magic number from PhET's PhotonEmissionColorMap.getColor

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var column;

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
		 * Gets all the colors on the right edge by taking the particle
		 *   color and multiplying it by each particle's alpha value.
		 *   Stores it in the [out] array given.
		 */
		getEdgeColors: function(out) {
			column = this.particles[this.particles.length - 1];
			for (var j = 0; j < column.length; j++) {
				out[j] = Utils.toRgba(this.color, column[j].alpha * this.brightness, true);
			}
		},

		/**
		 *
		 */
		enableScreenMode: function() {
			this.$el.addClass('rotated');
		},

		/**
		 *
		 */
		disableScreenMode: function() {
			this.$el.removeClass('rotated');
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
