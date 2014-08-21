
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
		this.lattice = options.lattice;
		if (_.isUndefined(this.lattice))
			throw 'WavePropagator requires an initial lattice to function!';

		// Lattice that is padded on every side by the damping scale
		this.paddedLat = this.createPaddedLattice(this.lattice);

		// Lattices from previous steps
		this.prevLat1 = this.paddedLat.clone();
		this.prevLat2 = this.paddedLat.clone();
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

	var i,
	    j,
	    width,
	    height,
	    clone,
	    cSquared,
	    sample,
	    paddedLatData,
	    prevLat1Data,
	    prevLat2Data;

	_.extend(WavePropagator.prototype, {

		/**
		 * This function is a mixture of ClassicalWavePropagator.propagate and
		 *   DampedClassicalWavePropagator.propagate.  It starts off by copying
		 *   the simulation's true lattice to a padded version where extra
		 *   damped values propagate into the padded "damping" region. Then
		 *   after propagation is performed on every cell in the padded lattice,
		 *   the rows and columns in the padded lattice that correspond to the
		 *   true lattice's edges are damped, and then the whole lattice is
		 *   copied to the historical this.prevLat1 and this.prevLat2 in succession.
		 *   After that, we perform extra damping on the entire lattice.
		 *   Finally, we copy the relevant region of the padded lattice back to
		 *   the simulation's true lattice and are finished.
		 *
		 * Original discrete wave propagation model from:
		 *   http://www.mtnmath.com/whatth/node47.html
		 */
		propagate: function() {
			// Copy simulation's lattice values to padded lattice
			this.paddedLat.copyArea(this.lattice, this.lattice.width, this.lattice.height, 0, 0, this.dampX, this.dampY);

			// Perform propagation on padded lattice
			this._propagate();

			// TODO: perform damping

			// Copy simulation's new lattice values back from the padded lattice
			this.lattice.copyArea(this.paddedLat, this.lattice.width, this.lattice.height, this.dampX, this.dampY, 0, 0);
		},

		/**
		 * Perform propagation from the discrete wave propagation model outlined
		 *   in Paul Budnik's "What is and what will be" found here: 
		 *   http://www.mtnmath.com/whatth/node47.html
		 */
		_propagate: function() {

			// Avoid object lookups when possible
			paddedLatData = this.paddedLat.data;
			prevLat1Data  = this.prevLat1.data;
			prevLat2Data  = this.prevLat2.data;

			/*
			 * c^2 is a coefficient from PhET's equation representing the squared
			 *   velocity. I think it's actually supposed to be dependent on the
			 *   distance from the epicenter, but it's a constant in PhET's code
			 *   and in the approximation equation given in Paul Budnik's book.
			 */
			cSquared = 0.5 * 0.5;

			/*
			 * We're starting with a border of 1 so we don't go out of bounds
			 *   when collecting samples with a 3x3 cell area.
			 */
			width  = this.paddedLat.width - 1;
			height = this.paddedLat.height - 1;
			for (i = 1; i < width; i++) {
				for (j = 1; j < height; j++) {

					// TODO: check for potentials

					sample = prevLat1Data[i - 1][j] + prevLat1Data[i + 1][j]
					       + prevLat1Data[i][j - 1] + prevLat1Data[i][j + 1]
					       + (-4 * prevLat1Data[i][j]);

					paddedLatData[i][j] = (cSquared * sample) + (2 * prevLat1Data[i][j]) - prevLat2Data[i][j];
				}
			}

			// Save history of lattice states for propagation and damping
			this.prevLat2.copy(this.prevLat1);
			this.prevLat1.copy(this.paddedLat);
		},

		/**
		 * This function is meant for the padded lattice row that corresponds
		 *   to the simulation lattice's edge.  If it is performed on a
		 *   lattice's actual edge, dy could take it out of bounds!
		 */
		dampHorizontalEdge: function(lattice, y, dy) {
			for (i = 0; i < lattice.width; i++)
				lattice.data[i][y] = this.prevLat2[i][y + dy];
		},

		/**
		 * This function is meant for the padded lattice col that corresponds
		 *   to the simulation lattice's edge.  If it is performed on a
		 *   lattice's actual edge, dx could take it out of bounds!
		 */
		dampVerticalEdge: function(lattice, x, dx) {
			for (j = 0; j < lattice.height; j++)
				lattice.data[x][j] = this.prevLat2[x + dx][j];
		},

		/**
		 * From "getDamp(int depthInDampingRegion)" in DampedClassicalWavePropagator
		 */
		getDampingCoefficient: function(depthInDampingRegion) {
			return ( 1 - depthInDampingRegion * 0.0001 );
		},

		/**
		 * Just creates a lattice with extra padding around it
		 */
		createPaddedLattice: function(lattice) {
			clone = new Lattice2D({
				width:  lattice.width  + this.dampX * 2,
				height: lattice.height + this.dampY * 2,
				initialValue: 0
			});
			return clone;
		},

		/**
		 * Because the value of lattice[x][y] during propagation is always a function
		 *   of prevLat1[x][y] and prevLat2[x][y], we need to set these historical
		 *   lattice point values if we ever want a change in a point's value to last 
		 *   through  propagation.  The oscillator calls this function instead of 
		 *   applying its oscillating values directly to the current lattice because
		 *   that current lattice will just be overriden when it passes through the
		 *   propagation function.
		 */
		setSourceValue: function(x, y, val) {
			this.prevLat1.data[x + this.dampX][y + this.dampY] = val;
			this.prevLat2.data[x + this.dampX][y + this.dampY] = val;
		}
	});

	return WavePropagator;
});