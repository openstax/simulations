define(function(require) {

	'use strict';

	var _ = require('underscore');

	var WaterSimulation  = require('../../models/wave-sim/water.js');
	var SimView          = require('../sim.js');
	var WaterHeatmapView = require('../heatmap/water.js');

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

		/**
		 * Uses the sim view's WaveSimulation instance to determine
		 *   appropriate options for initializing the GraphView and
		 *   returns them as an object.
		 */
		getGraphViewOptions: function() {
			return {
				title: 'Cross-Section Side View',
				x: {
					start: 0,
					end: this.waveSimulation.get('dimensions').width,
					step: this.waveSimulation.get('dimensions').width / 10,
					label: 'x-Position (' + this.waveSimulation.get('units').distance + ')',
					showNumbers: true
				},
				y: {
					start: -1,
					end: 1,
					step: 0.5,
					label: 'Water Level',
					showNumbers: false
				},
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView
			};
		},
	});

	return WaterSimView;
});
