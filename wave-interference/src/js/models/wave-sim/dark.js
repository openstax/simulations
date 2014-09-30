..define(function (require) {

	'use strict';

	var _ = require('lodash');

	var WaveSimulation = require('../wave-sim.js');
	var DarkPropagator = require('../dark-propagator.js');

	/**
	 *
	 */
	var DarkWaveSimulation = WaveSimulation.extend({
		/*
		 *
		 */
		initialize: function(options) {
			// We want to perform the propagation on a throwaway lattice, not the real one
			this.realWaveSimulation = options.realWaveSimulation;

			WaveSimulation.prototype.initialize.apply(this, [options]);

			_.each(this.realWaveSimulation.oscillators, function(oscillator, index) {
				this.listenTo(oscillator, 'change', function(oscillator) {
					this.oscillators[index].set('enabled', oscillator.get('enabled'));
				});
			}, this);
			
		},

		/*
		 *
		 */
		initPropagator: function() {
			this.propagator = new DarkPropagator({
				lattice: this.lattice,
				waveSimulation: this,
				potential: this.realWaveSimulation.potential
			});
		},
	});

	return DarkWaveSimulation;
});
