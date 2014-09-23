define(function(require) {

	'use strict';

	var _ = require('underscore');

	var HeatmapView = require('views/heatmap');

	/*
	 * Constants
	 */
	var EPSILON = 0.025; // A magic number from PhET's PhotonEmissionColorMap.getColor

	/*
	 * "Local" variables for functions to share and recycle
	 */

	/**
	 * 
	 */
	var LightHeatmapView = HeatmapView.extend({

		initialize: function(options) {
			// Default values
			options = _.extend({
				title: 'Electric Field &ndash; XZ-Plane',
				color: '#f00'
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

	});

	return LightHeatmapView;
});
