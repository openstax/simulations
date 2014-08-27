
define(function(require) {

	'use strict';

	var _         = require('underscore');
	var Utils     = require('utils/utils');
	var Potential = require('models/potential');

	/**
	 * Named after PhET's BarrierPotential with the flexibility of WallPotential
	 */
	var BarrierPotential = function(options) {

		Potential.apply(this, [options]);

		// Default values
		options = _.extend({
			start: {
				x: 0,
				y: 0
			},
			end: {
				x: 0,
				y: 0
			},
			thickness: 3,
			potentialValue: 100
		}, options);

		this.start = options.start;
		this.end   = options.end;

		this.thickness = options.thickness;

		this.potentialValue = options.potentialValue;
	};

	_.extend(BarrierPotential.prototype, Potential.prototype, {

		/**
		 * If the point (x, y) is close to the line (distance less than half thickness),
		 *   it will return the BarrierPotential's potential value.
		 */
		getPotential: function(x, y, time) {
			if (Utils.distanceFromLine(x, y, this.start.x, this.start.y, this.end.x, this.end.y) <= this.thickness / 2)
				return this.potentialValue;
			else
				return 0;
		},

	});

	return BarrierPotential;
});