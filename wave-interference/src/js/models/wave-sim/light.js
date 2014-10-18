define(function (require) {

	'use strict';

	var _ = require('underscore');

	var WaveSimulation     = require('../wave-sim');
	var DarkWaveSimulation = require('../wave-sim/dark');

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
			var options = this.toJSON();
			options.realWaveSimulation = this;
			this.darkWaveSimulation = new DarkWaveSimulation(options);

			this.off('change', this.setDarkWaveProperties);
			this.on( 'change', this.setDarkWaveProperties);
		},

		setDarkWaveProperties: function(model) {
			this.darkWaveSimulation.set(model.changed);
		},

		/**
		 * For when we change the color
		 */
		resetWave: function() {
			this.time = 0;

			this.lattice.reset(0);
			this.propagator.reset();
			this.darkWaveSimulation.lattice.reset(0);

			this.trigger('reset');
		},

		/**
		 * Inside the fixed-interval loop
		 */
		_update: function() {
			WaveSimulation.prototype._update.apply(this);

			this.darkWaveSimulation.time = this.time;
			this.darkWaveSimulation._update();
		},
	});

	return LightSimulation;
});
