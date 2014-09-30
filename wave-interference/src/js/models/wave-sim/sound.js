define(function (require) {

	'use strict';

	var _ = require('underscore');

	var WaveSimulation = require('../wave-sim.js');

	/**
	 *
	 */
	var SoundSimulation = WaveSimulation.extend({

		defaults: _.extend({}, WaveSimulation.prototype.defaults, {

			// Values from PhET's SoundModule class

			dimensions: {
				width: 100,
				height: 100
			},
			units: {
				distance: 'cm',
				time: 'ms'
			},
			timeScale: 1.0 / 1.42,

			oscillatorName: 'Speaker',
			oscillatorNamePlural: 'Speakers',
		})

	});

	return SoundSimulation;
});
