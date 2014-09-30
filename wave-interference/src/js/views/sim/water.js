define(function(require) {

	'use strict';

	var _ = require('lodash');

	var WaterSimulation  = require('../../models/wave-sim/water.js');
	var SimView          = require('../sim.js');
	var WaterHeatmapView = require('../heatmap/water.js');

	var WaterSimView = SimView.extend({

		events: _.extend(SimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Water'
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
