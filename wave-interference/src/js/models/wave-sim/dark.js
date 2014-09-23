define(function (require) {

	'use strict';

	var _ = require('underscore');

	var WaveSimulation = require('models/wave-sim');
	var DarkPropagator = require('models/dark-propagator');

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
		},

		/*
		 *
		 */
		initPropagator: function() {
			this.propagator = new DarkPropagator({
				lattice: this.lattice,
				realLattice: this.realWaveSimulation.lattice,
				potential: this.realWaveSimulation.potential
			});
		},
	});

	return DarkWaveSimulation;
});
