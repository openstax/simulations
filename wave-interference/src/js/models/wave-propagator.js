
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
		this.plat = this.createPaddedLattice();

		// Lattices from previous steps
		this.prev1 = this.plat.clone();
		this.prev2 = this.plat.clone();
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
	    w,
	    h,
	    clone,
	    row,
	    cSquared,
	    sample,
	    plat,
	    prev1,
	    prev2;

	_.extend(WavePropagator.prototype, {

		/**
		 * This function is a mixture of ClassicalWavePropagator.propagage and
		 *   DampedClassicalWavePropagator.propagate.  It starts off by copying
		 *   the simulation's true lattice to a padded version where extra
		 *   damped values propagate into the padded "damping" region. Then
		 *   after propagation is performed on every cell in the padded lattice,
		 *   the rows and columns in the padded lattice that correspond to the
		 *   true lattice's edges are damped, and then the whole lattice is
		 *   copied to the historical this.prev1 and this.prev2 in succession.
		 *   After that, we perform extra damping on the entire lattice.
		 *   Finally, we copy the relevant region of the padded lattice back to
		 *   the simulation's true lattice and are finished.
		 *
		 * Original discrete wave propagation model from:
		 *   http://www.mtnmath.com/whatth/node47.html
		 */
		propagate: function(lattice) {
			// Copy simulation's lattice values to padded lattice
			this.plat.copyArea(lattice, lattice.w, lattice.h, this.dampX, this.dampY, 0, 0);

			// Perform propagation on padded lattice
			this._propagate();

			// TODO: perform damping

			// Copy simulation's new lattice values back from the padded lattice
			lattice.copyArea(this.plat, this.plat.w, this.plat.h, 0, 0, this.dampX, this.dampY);
		},

		/**
		 * Perform propagation from the discrete wave propagation model outlined
		 *   in Paul Budnik's "What is and what will be" found here: 
		 *   http://www.mtnmath.com/whatth/node47.html
		 */
		_propagate: function() {

			// Avoid object lookups when possible
			plat  = this.plat.data;
			prev1 = this.prev1.data;
			prev2 = this.prev2.data;

			cSquared = 0.5 * 0.5;

			/*
			 * We're starting with a border of 1 so we don't go out of bounds
			 *   when collecting samples with a 3x3 cell area.
			 */
			w = this.plat.w - 1;
			h = this.plat.h - 1;
			for (i = 1; i < w; i++) {
				for (j = 1; j < h; j++) {

					// TODO: check for potentials

					sample = prev1[i - 1][j] + prev1[i + 1][j]
					       + prev1[i][j - 1] + prev1[i][j + 1]
					       + (-4 * prev1[i][j]);

					plat[i][j] = (cSquared * sample) + (2 * prev1[i][j]) - prev2[i][j];
				}
			}
		},

		/**
		 * This function is meant for the padded lattice row that corresponds
		 *   to the simulation lattice's edge.  If it is performed on a
		 *   lattice's actual edge, dy could take it out of bounds!
		 */
		dampHorizontalEdge: function(lattice, y, dy) {
			for (i = 0; i < lattice.w, i++)
				lattice.data[i][y] = this.prev2[i][y + dy];
		}

		/**
		 * This function is meant for the padded lattice col that corresponds
		 *   to the simulation lattice's edge.  If it is performed on a
		 *   lattice's actual edge, dx could take it out of bounds!
		 */
		dampVerticalEdge: function(lattice, x, dx) {
			for (j = 0; j < lattice.h, j++)
				lattice.data[x][j] = this.prev2[x + dx][j];
		}

		/**
		 * From "getDamp(int depthInDampingRegion)" in DampedClassicalWavePropagator
		 */
		getDampingCoefficient: function(depthInDampingRegion) {
			return ( 1 - depthInDampRegion * 0.0001 );
		},

		/**
		 * Just creates a lattice with extra padding around it
		 */
		createPaddedLattice: function(lattice) {
			clone = new Lattice2D({
				w: lattice.w + this.dampX * 2,
				h: lattice.h + this.dampY * 2,
				initialValue: 0
			});
			return clone;
		},
	});

	return Lattice2D;
});