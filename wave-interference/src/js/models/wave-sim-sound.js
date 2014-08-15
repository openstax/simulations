define([
	'underscore', 
	'models/wave-sim'
], function (_, WaveSimulation) {

	'use strict';

	var SoundSimulation = WaveSimulation.extend({

		defaults: _.extend({}, WaveSimulation.prototype.defaults, {

			// Values from PhET's SoundModule class

			dimensions: {
				w: 100,
				h: 100
			},
			units: {
				distance: 'cm',
				time: 'ms'
			},
			timeScale: 1.0 / 1.42 
		})

	});

	return SoundSimulation;
});
