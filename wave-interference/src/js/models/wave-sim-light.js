define([
	'underscore', 
	'models/wave-sim'
], function (_, WaveSimulation) {

	'use strict';

	var LightSimulation = WaveSimulation.extend({

		defaults: _.extend({}, WaveSimulation.prototype.defaults, {

			// Values from PhET's LightModule class

			damping: {
				x: 10,
				y: 40
			},
			dimensions: {
				w: 4200,
				h: 4200
			},
			units: {
				distance: 'nm',
				time: 'femtoseconds'
			},
			timeScale: 3.6
		})

	});

	return LightSimulation;
});
