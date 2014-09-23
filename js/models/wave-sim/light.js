define(function (require) {

	'use strict';

	var _ = require('underscore');

	var WaveSimulation = require('models/wave-sim');
	var DarkPropagator = require('models/dark-propagator');

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

		/*
		 *
		 */
		initialize: function(options) {
			WaveSimulation.prototype.initialize.apply(this, [options]);

			this.initDarkWaveSimulation();
		},

		initDarkWaveSimulation: function() {
			this.darkWaveSimulation = new WaveSimulation(this.toJSON());
			this.darkWaveSimulation.propagator = new DarkPropagator({
				lattice: this.lattice,
				potential: this.potential
			});
			
		},

		/**
		 * Inside the fixed-interval loop
		 */
		_update: function() {
			WaveSimulation.prototype._update.apply(this);

			this.darkWaveSimulation._update();
		},
	});

	return LightSimulation;
});
