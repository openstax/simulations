define(function(require) {

	'use strict';

	var _ = require('underscore');

	var HeatmapView = require('views/heatmap');

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
		},

		/**
		 * Makes it so a value of false returns an alpha of 0, making
		 *   the particle invisible.
		 */
		alphaFromCellValue: function(value) {
			if (value === false)
				return 0;

			return HeatmapView.prototype.alphaFromCellValue.apply(this, [value]);
		},

	});

	return LightHeatmapView;
});
