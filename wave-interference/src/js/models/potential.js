
define(function(require) {

	'use strict';

	var _ = require('underscore');

	var Potential = function() {};

	_.extend(Potential.prototype, {

		getPotential: function(x, y, time) { return 0; },

	});

	return Potential;
});