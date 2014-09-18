
define(function(require) {

	'use strict';

	var _          = require('underscore');
	var Lattice2D  = require('models/lattice2d');
	var WavePropagator = require('models/propagator');

	/**
	 * Used in the light module, the DarkPropagator comes from a subclass of PhET's
	 *   DarkWave.java.  It keeps track of the wave's propagation separately and
	 *   determines the wave's front so we can make every particle that the light
	 *   hasn't touched yet dark.
	 */
	var DarkPropagator = function(options) {
		
		// We want to perform the propagation on a throwaway lattice
		this.realLattice = options.lattice;
		this.lattice = options.lattice.clone();
		
		// Call the WavePropagator's constructor
		WavePropagator.prototype.apply(this, [options]);

		this.numSteps = 0;
	};

	/*
	 * "Local" vars
	 */
	var i,
	    j,
	    i2,
	    j2,
	    width,
	    height,
	    paddedWidth,
	    paddedHeight,
	    dampX,
	    dampY,
	    lattice,
	    realLattice,
	    passed,
	    checked,
	    area,
	    fraction;

	_.extend(DarkPropagator.prototype, {

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

			width  = this.realLattice.width;
			height = this.realLattice.height;

			paddedWidth  = this.paddedLat.width;
			paddedHeight = this.paddedLat.height;

			for (i = 0; i < paddedWidth; i++) {
				for (j = 0; j < paddedHeight; j++) {
					if (this.isWavefront(i, j)) {
						this.setSourceValue(i, j, 0);

						i2 = i - dampX;
						j2 = j - dampY;

						if (i2 >= 0 && i2 < width && j2 >= 0 && j2 < height) {
							// Set it to false so it displays as nothing
							realLattice[i2][j2] = false;
						}
					}
				}
			}
		},

		/**
		 * This is almost a straight copy of PhET's isWavefront.
		 */
		isWavefront: function(x, y) {
			passed  = 0;
			checked = 0;
			area = 1;

			lattice = this.lattice;

			for (i = -a; i <= a; i++) {
				for (j = -a; j <= a; j++) {
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