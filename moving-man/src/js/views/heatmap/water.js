define(function(require) {

	'use strict';

	var _ = require('underscore');

	var HeatmapView          = require('views/heatmap');
	var FaucetOscillatorView = require('views/oscillator/faucet');

	/*
	 * "Local" variables for functions to share and recycle
	 */


	/**
	 * WaterHeatmapView is the water simulation version of the HeatmapView 
	 *   that uses different sub-views where necessary.
	 */
	var WaterHeatmapView = HeatmapView.extend({

		initialize: function(options) {
			// Default values
			options = _.extend({
				title: 'Water &ndash; Top View',
				color: '#fff'
			}, options);

			HeatmapView.prototype.initialize.apply(this, [ options ]);
		},

		/**
		 * Overrides HeatmapView.renderOscillatorView so it can use the
		 *   FaucetOscillatorView instead of the plain OscillatorView.
		 */
		renderOscillatorView: function(oscillator) {
			// Create a new view and render it
			var oscillatorView = new FaucetOscillatorView({
				heatmapView: this,
				oscillator: oscillator
			});
			oscillatorView.render();

			this.addOscillatorView(oscillatorView);
		},

	});

	return WaterHeatmapView;
});
