define([
	'jquery', 
	'underscore', 
	'backbone',
	'pixi',

	'views/sim',
	'models/wave-sim/sound'
], function ($, _, Backbone, PIXI, SimView, SoundSimulation) {

	'use strict';

	var SoundModuleView = SimView.extend({

		initialize: function(options) {
			options = _.extend({
				waveSimulation: new SoundSimulation(),
				heatmapBrightness: 0.5,
				title: 'Sound'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);
		},

		update: function(time, delta) {
			SimView.prototype.update.apply(this, [time, delta]);
		}
	});

	return SoundModuleView;
});
