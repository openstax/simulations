define(function (require) {

	'use strict';

	var _ = require('underscore');

	var WaveSimulation = require('models/wave-sim');
	var Lattice2D      = require('models/lattice2d');

	/**
	 *
	 */
	var LightSimulation = WaveSimulation.extend({

		defaults: _.extend({}, WaveSimulation.prototype.defaults, {

			// Values from PhET's LightModule class

			damping: {
				x: 10,
				y: 40
			},
			dimensions: {
				width: 4200,
				height: 4200
			},
			units: {
				distance: 'nm',
				time: 'femtoseconds'
			},
			timeScale: 3.6,

			oscillatorName: 'Light',
			oscillatorNamePlural: 'Lights',
		}),

		/**
		 * Need to have the dark propagator executing after the normal one
		 */
		initPropagator: function() {
			WaveSimulation.prototype.initPropagator.apply(this);


		}

	});

	return LightSimulation;
});
