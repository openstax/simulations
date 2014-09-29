define(function (require) {

	'use strict';

	var _ = require('underscore');

	var WaveSimulation = require('models/wave-sim');

	/**
	 *
	 */
	var WaterSimulation = WaveSimulation.extend({

		defaults: _.extend({}, WaveSimulation.prototype.defaults, {

			// Values from PhET's WaterModule class

			dimensions: {
				width: 10,
				height: 10
			},
			units: {
				distance: 'cm',
				time: 'sec'
			},

			oscillatorName: 'Faucet',
			oscillatorNamePlural: 'Faucets',
		}),

		// update: function(time, delta) {
		// 	WaveSimulation.prototype.update.apply(this, [time, delta]);
		// },

	});

	return WaterSimulation;
});
