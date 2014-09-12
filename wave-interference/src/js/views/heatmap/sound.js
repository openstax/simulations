define(function(require) {

	'use strict';

	var _ = require('underscore');

	var HeatmapView           = require('views/heatmap');
	var SpeakerOscillatorView = require('views/oscillator/speaker');

	/*
	 * "Local" variables for functions to share and recycle
	 */


	/**
	 * SoundHeatmapView is the sound simulation version of the HeatmapView 
	 *   that uses different sub-views where necessary.
	 */
	var SoundHeatmapView = HeatmapView.extend({

		initialize: function(options) {
			// Default values
			options = _.extend({
				title: 'Pressure Map &ndash; XY Plane',
				color: '#000'
			}, options);

			HeatmapView.prototype.initialize.apply(this, [ options ]);
		},

		/**
		 * Overrides HeatmapView.renderOscillatorView so it can use the
		 *   SpeakerOscillatorView instead of the plain OscillatorView.
		 */
		renderOscillatorView: function(oscillator) {
			// Create a new view and render it
			var oscillatorView = new SpeakerOscillatorView({
				heatmapView: this,
				oscillator: oscillator
			});
			oscillatorView.render();

			this.addOscillatorView(oscillatorView);
		},

	});

	return SoundHeatmapView;
});
