define([
	'underscore', 
	'models/wave-sim'
], function (_, WaveSimulation) {

	'use strict';

	var WaterSimulation = WaveSimulation.extend({

		defaults: _.extend({}, WaveSimulation.prototype.defaults, {

			// Values from PhET's WaterModule class

			dimensions: {
				w: 10,
				h: 10
			},
			units: {
				distance: 'cm',
				time: 's'
			}
		}),

		// update: function(time, delta) {
		// 	WaveSimulation.prototype.update.apply(this, [time, delta]);
		// },

	});

	return WaterSimulation;
});
