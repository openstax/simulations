define(function(require) {

	'use strict';

	var _ = require('underscore');

	var WaterSimulation  = require('models/wave-sim/water');
	var SimView          = require('views/sim');
	var WaterHeatmapView = require('views/heatmap/water');

	var WaterSimView = SimView.extend({

		//template: _.template(template),
		// tagName: 'section',
		// className: 'sim-view',

		events: _.extend(SimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				waveSimulation: new WaterSimulation(),
				heatmapBrightness: 0.5,
				title: 'Water'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);
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
