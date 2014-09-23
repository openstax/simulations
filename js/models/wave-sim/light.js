define(function (require) {

	'use strict';

	var _ = require('underscore');

	var WaveSimulation = require('models/wave-sim');
	var DarkWaveSimulation = require('models/wave-sim/dark');

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

			this.on('change', function(model){
				this.darkWaveSimulation.set(model.changed);
			});
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
