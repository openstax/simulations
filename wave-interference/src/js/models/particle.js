
define(function(require) {

	'use strict';
	
	var _        = require('underscore');
	var glMatrix = require('glmatrix');

	var Utils = require('utils/utils');

	/**
	 * The Particle model represents a particle of air for the sound wave simulation.
	 *   In addition to the standard heatmap of the other two simulations, the sound
	 *   simulation has a particle view that attempts to show the changes in air
	 *   pressure.  Code is based off of PhET's Particle class, which can be found in
	 *   the PressureWaveGraphic.java file as an internal class.
	 */
	var Particle = function(options) {

		// Default values
		options = _.extend({
			spacingBetweenCells: 1,
			i: 0,
			j: 0,
			acceleration: 0.3,
			friction: 0.97,
			maxVelocity: 3
		}, options);

		if (options.lattice)
			this.lattice = options.lattice;
		else
			throw 'Particle requires a lattice to render.';
		
		this.spacingBetweenCells = options.spacingBetweenCells;

		this.homeX = options.i;
		this.homeY = options.j;

		// Called 'a' and 'b' in PhET's code
		this.destinationX = options.i * this.spacingBetweenCells;
		this.destinationY = options.j * this.spacingBetweenCells;
		this.x = this.destinationX;
		this.y = this.destinationY;

		this.speed = 4; // pixels per time step
		this.velocity = glMatrix.vec2.create();
		this.acceleration = options.acceleration;
		this.friction = options.friction;
		this.maxVelocity = options.maxVelocity;

		// Just keeping copies so we aren't filling up garbage collection
		this._searchResult = {};
		this._bestPoint = {};
		this._vec = glMatrix.vec2.create();
	};

	/**
	 * Internal constants
	 */
	var WINDOW_SIZE = 8;
	var HALF_WINDOW_SIZE = WINDOW_SIZE / 2;

	/**
	 * These "local" variables assume no concurrent use of this class.
	 */
	var bestValue,
	    bestPoint,
	    homeX,
	    homeY,
	    i,
	    j,
	    searchResults,
	    prefX,
	    prefY,
	    accelScale,
	    frictionScale,
	    vec,
	    dest;

	_.extend(Particle.prototype, {

		/**
		 * This update function comes from the PhET Particle's update
		 *   function.  PhET comments included, but code is modified
		 *   and optimized where necessary.
		 */
		update: function(time) {
			// [PhET: Look near to x,y (but don't stray from homeX and homeY)]
			searchResults = this.searchForTarget();
			bestPoint = searchResults.location;
			if (bestPoint !== null) {
				/* 
				 * Modified the block structure and got rid of code
				 *   that wasn't actually getting executed.
				 */
				if (Math.abs(searchResults.pressure) < 0.01) {
					// Go back towards the home x and y
					prefX = this.homeX * this.spacingBetweenCells;
					prefY = this.homeY * this.spacingBetweenCells;
					accelScale = 0.5;
					frictionScale = 1.0 / this.friction * 0.99;
				}
				else {
					// [PhET: Step towards the peak]
					prefX = bestPoint.x * this.spacingBetweenCells;
					prefY = bestPoint.y * this.spacingBetweenCells;
					accelScale = 1;
					frictionScale = 1;
				}
				
				vec = this._vec;
				vec[0] = prefX - this.destinationX;
				vec[1] = prefY - this.destinationY;

				this.accelerateToTarget(vec, accelScale, frictionScale);
			}
		},

		/**
		 * Resets velocity vector back to <0, 0>
		 */
		reset: function() {
			glMatrix.vec2.scale(this.velocity, this.velocity, 0);
		},

		/**
		 * Allows the spacing between cells to be changed and updates
		 *   everything that uses spacingBetweenCells.
		 */
		resize: function(spacingBetweenCells) {
			// scalar with which to scale the coordinates
			var scale = spacingBetweenCells / this.spacingBetweenCells;

			this.spacingBetweenCells = spacingBetweenCells;

			this.destinationX *= scale;
			this.destinationY *= scale;

			this.x *= scale;
			this.y *= scale;
		},

		/**
		 * Modeled after PhET Particle's searchForMin.  There were
		 *   two functions: searchForMin and searchForMax.  But
		 *   searchForMax was never used in the final version, so
		 *   it's been cut from the roster.
		 */
		searchForTarget: function() {
			homeX = this.homeX;
			homeY = this.homeY;

			bestValue = Number.POSITIVE_INFINITY;
			bestPoint = null;

			this._searchResult.pressure = null;
			this._searchResult.location = null;

			for (i = -HALF_WINDOW_SIZE; i <= HALF_WINDOW_SIZE; i++) {
				for (j = -HALF_WINDOW_SIZE; j <= HALF_WINDOW_SIZE; j++) {
					if (this.inBounds(homeX + i, homeY + j)) {
						if (bestPoint == null || (
								this.lattice.getValue( homeX + i, homeY + j ) < bestValue &&
								Utils.lineLength(homeX, homeY, homeX + i, homeY + j) <= HALF_WINDOW_SIZE 
							)
						) {
							bestPoint = this._bestPoint;
							this._bestPoint.x = homeX + i;
							this._bestPoint.y = homeY + j;
							bestValue = this.lattice.getValue(homeX + i, homeY + j);
						}
					}
				}
			}

			this._searchResult.pressure = bestValue;
			this._searchResult.location = this._bestPoint;

			return this._searchResult;
		},

		/**
		 * Based on PhET Particle's accelerateToTarget (comments added)
		 */
		accelerateToTarget: function(vec, accelScale, frictionScale) {
			if (glMatrix.vec2.length(vec) >= 1.2) {
				// We only want the direction, so normalize it
				glMatrix.vec2.normalize(vec, vec);

				// Apply acceleration
				glMatrix.vec2.scale(vec, vec, this.acceleration * accelScale);
				glMatrix.vec2.add(this.velocity, this.velocity, vec);

				// Limit the velocity
				if (this.velocity[0] > this.maxVelocity)
					this.velocity[0] = this.maxVelocity;
				if (this.velocity[1] > this.maxVelocity)
					this.velocity[1] = this.maxVelocity;

				if (this.velocity[0] < -this.maxVelocity)
					this.velocity[0] = -this.maxVelocity;
				if (this.velocity[1] < -this.maxVelocity)
					this.velocity[1] = -this.maxVelocity;

				// Apply friction
				glMatrix.vec2.scale(this.velocity, this.velocity, this.friction * frictionScale);

				// Figure out where we're going now
				dest = this._vec;
				this.destinationX = this.destinationX + this.velocity[0];
				this.destinationY = this.destinationY + this.velocity[1];

				this.x = this.destinationX;
				this.y = this.destinationY;
			}
		},

		/**
		 * Just checks to make sure it's within the bounds of the lattice.
		 *
		 * Note: The original PhET version had this comment:
		 *   "todo should n't this be i>=0 j>=0?"
		 *   As we are attempting to replicate the behavior at the moment,
		 *   I will leave the code as it is.
		 */
		inBounds: function(i, j) {
			return i > 0 && j > 0 && i < this.lattice.width && j < this.lattice.height;
		},
	});

	return Particle;
});