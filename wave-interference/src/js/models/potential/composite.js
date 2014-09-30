
define(function(require) {

	'use strict';

	var _         = require('lodash');
	var Potential = require('../potential.js');

	/**
	 * From PhET's CompositePotential
	 */
	var CompositePotential = function() {

		Potential.apply(this);

		this.potentials = [];

	};

	var sum,
	    i;

	_.extend(CompositePotential.prototype, Potential.prototype, {

		/**
		 * Returns the sum of all the potentials
		 */
		getPotential: function(x, y, time) {
			sum = 0;
			for (i = 0; i < this.potentials.length; i++)
				sum += this.potentials[i].getPotential(x, y, time);
			return sum;
		},

		/**
		 *
		 */
		add: function(potential) {
			this.potentials.push(potential);
		},

		/**
		 *
		 */
		remove: function(potential) {
			for (i = 0; i < this.potentials.lenth; i++) {
				if (this.potentials[i] == potential) {
					this.potentials.splice(i, 1);
					break;
				}
			}
		},

	});

	return CompositePotential;
});