
define([
	'underscore',
	'models/lattice2d'
], function(_, Lattice2D) {

	'use strict';

	var WavePropagator = function(options) {

		// Default values
		options = _.extend({
			damping: {
				x: 20,
				y: 20
			},
		}, options);
		
		// Object properties
		this.potentials = options.potentials || []; // The lattice point values
		this.dampX = options.damping.x;
		this.dampY = options.damping.y;

		// Simulation's lattice
		this.lattice = options.lattice || throw 'WavePropagator requires an initial lattice to function!';

		// Lattice that is padded on every side by the damping scale
		this.w = this.createPaddedLattice();

		// Lattices from previous steps
		this.prev1 = this.w.clone();
		this.prev2 = this.w.clone();
	};

	/*
	 * I'm declaring some variables that exist in this function's scope so that
	 *   1) These functions aren't pushing and popping off the stack every time
	 *        they're called (and this is important because these functions are
	 *        called very frequently) and
	 *   2) I don't want to make them public properties on the object.
	 *
	 *                                                               -- Patrick
	 */

	var sum,
	    count,
	    i,
	    j,
	    clone,
	    row;

	_.extend(WavePropagator.prototype, {

		/**
		 * 
		 */
		propagate: function(lattice) {

		},

		createPaddedLattice: function(lattice) {

		}
	});

	return Lattice2D;
});