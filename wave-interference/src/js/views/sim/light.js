define([
	'jquery', 
	'underscore', 
	'backbone',

	'views/sim',
	'models/wave-sim/light'
], function ($, _, Backbone, SimView, LightSimulation) {

	'use strict';

	var LightSimView = SimView.extend({

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Light'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);
		},

		/**
		 * Initializes the WaveSimulation.
		 */
		initWaveSimulation: function() {
			this.waveSimulation = new LightSimulation();
		}

	});

	return LightSimView;
});
