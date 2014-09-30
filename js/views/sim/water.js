define(function(require) {

	'use strict';

	var _ = require('underscore');

	var WaterSimulation  = require('models/wave-sim/water');
	var SimView          = require('views/sim');
	var WaterHeatmapView = require('views/heatmap/water');

	var WaterSimView = SimView.extend({

		events: _.extend(SimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Water',
				detectorYLabel: 'Water Level'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);
		},

		/**
		 * Initializes the WaveSimulation.
		 */
		initWaveSimulation: function() {
			this.waveSimulation = new WaterSimulation();
		},

		/**
		 * Initializes the HeatmapView.
		 */
		initHeatmapView: function() {
			this.heatmapView = new WaterHeatmapView(this.getHeatmapViewOptions());
		},
	});

	return WaterSimView;
});
