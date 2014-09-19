
define(function(require) {

	'use strict';

	var _ = require('underscore');

	var WavePropagator = require('models/wave-propagator');

	/**
	 * Used in the light module, the DarkPropagator comes from a subclass of PhET's
	 *   DarkWave.java.  It keeps track of the wave's propagation separately and
	 *   determines the wave's front so we can make every particle that the light
	 *   hasn't touched yet dark.
	 * It makes darkness where there is no light.
	 */
	var DarkPropagator = function(options) {
		
		// We want to perform the propagation on a throwaway lattice
		this.realLattice = options.lattice;
		options.lattice = options.lattice.clone();
		
		// Call the WavePropagator's constructor
		WavePropagator.apply(this, [options]);

		this.numSteps = 0;
	};

	/*
	 * "Local" vars
	 */
	var paddedWidth,
	    paddedHeight,
	    dampX,
	    dampY,
	    lattice,
	    realLattice,
	    passed,
	    checked,
	    area,
	    fraction;

	_.extend(DarkPropagator.prototype, WavePropagator.prototype, {

		/**
		 * Adds a check to see where the wave front is
		 */
		propagate: function() {
			// Carry on normal propagation
			WavePropagator.prototype.propagate.apply(this);

			this.numSteps++;

			realLattice = this.realLattice;

			dampX = this.dampX;
			dampY = this.dampY;

			paddedWidth  = this.paddedLat.width;
			paddedHeight = this.paddedLat.height;

			var i, j, i2, j2;

			for (i = 0; i < paddedWidth; i++) {
				for (j = 0; j < paddedHeight; j++) {
					if (this.isWavefront(this.paddedLat, i, j)) {
						//console.log(this.numSteps, i, j);
						this.setSourceValue(i, j, 0);

						i2 = i - dampX;
						j2 = j - dampY;

						if (realLattice.contains(i2, j2)) {
							// Set it to false so it displays as nothing
							realLattice.data[i2][j2] = false;
						}
					}
				}
			}
		},

		/**
		 *
		 */
		hasBeenModified: function(lattice, x, y) {
			return (Math.abs(lattice.getValue(x, y)) > 1E-6);
		},

		/**
		 * This is almost a straight copy of PhET's isWavefront.
		 */
		isWavefront: function(lattice, x, y) {
			passed  = 0;
			checked = 0;
			area = 1;

			var i, j;

			for (i = -area; i <= area; i++) {
				for (j = -area; j <= area; j++) {
					if (lattice.contains(x + i, y + j)) {
						checked++;
						if (Math.abs(lattice.getValue(x + i, y + j)) > 1E-6)
							passed++;
					}
				}
			}

			fraction = passed / checked;

			/*
			 * The missing explanation:
			 *   If values that pass are values that have been modified
			 *   before. If [fraction > 0], it means that at least one
			 *   of its sibling cells has been modified--this is true
			 *   of cells on the wavefront because they should have
			 *   modified cells on their left and unmodified cells on
			 *   their right.  But if [fraction === 1], that means it's
			 *   surrounded by modified values and is somewhere inside
			 *   the mass of cells that the wave has already passed
			 *   over. 
			 */
			return (fraction > 0 && fraction < 1);
		}
	});

	return DarkPropagator;
});