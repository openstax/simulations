
define(function(require) {

	'use strict';

	var _ = require('underscore');

	/**
	 * Potentials are the name the original PhET sim's authors used to describe the 
	 *   forces exerted by the walls and barriers.  My guess is that they were supposed 
	 *   to be scalar potentials (http://en.wikipedia.org/wiki/Scalar_potential), but
	 *   in the propagation function's implementation, their force is never taken into
	 *   consideration; they are simply regarded as filling a space or not filling a
	 *   space, so they might as well just be objects that tell whether or not they
	 *   occupy certain coordinates.  However, it is helpful to maintain this structure
	 *   so that different kinds of "potentials" can overload this function and decide
	 *   for themselves how to determine the occupation of a given coordinate.
	 */
	var Potential = function() {};

	_.extend(Potential.prototype, {

		getPotential: function(x, y, time) { return 0; },

	});

	return Potential;
});