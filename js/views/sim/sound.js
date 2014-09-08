define([
	'jquery', 
	'underscore', 
	'backbone',
	'pixi',

	'views/sim',
	'models/wave-sim/sound'
], function ($, _, Backbone, PIXI, SimView, SoundSimulation) {

	'use strict';

	var SoundSimView = SimView.extend({

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Sound'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);
		},

		/**
		 * Initializes the WaveSimulation.
		 */
		initWaveSimulation: function() {
			this.waveSimulation = new SoundSimulation();
		},

		update: function(time, delta) {
			SimView.prototype.update.apply(this, [time, delta]);
		}
	});

	return SoundSimView;
});
