
define(function(require) {

	'use strict';

	var _ = require('underscore');

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
			j: 0
		}, options);
		
		this.spacingBetweenCells = options.spacingBetweenCells;

		this.homeX = options.i;
		this.homeY = options.j;

		// Called 'a' and 'b' in PhET's code
		this.destinationX = options.i * this.spacingBetweenCells;
		this.destinationY = options.j * this.spacingBetweenCells;

		this.speed = 4; // pixels per time step


	};

	/**
	 * These "local" variables assume no concurrent use of this class.
	 */

	_.extend(Particle.prototype, {

		/**
		 * 
		 */
		update: function(time) {

		},

		/**
		 * Modeled after PhET Particle's searchForMin.  There were
		 *   two functions: searchForMin and searchForMax.  But
		 *   searchForMax was never used in the final version, so
		 *   it's been cut from the roster.
		 */
		searchForTarget: function() {
			
		},

		/**
		 * 
		 */
		accelerateToTarget: function() {
			
		},

		/**
		 * 
		 */
		stepToTarget: function() {
			
		},

		/**
		 * 
		 */
		inBounds: function(i, j) {
			
		},
	});

	return Particle;
});