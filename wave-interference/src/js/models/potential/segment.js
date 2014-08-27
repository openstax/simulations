
define(function(require) {

	'use strict';

	var _         = require('underscore');
	var Utils     = require('utils/utils');
	var Potential = require('models/potential');

	/**
	 * Based off of PhET's WallPotential
	 */
	var SegmentPotential = function(options) {

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
			thickness: 2,
			potentialValue: 100
		}, options);

		this.start = options.start;
		this.end   = options.end;

		this.thickness = options.thickness;

		this.potentialValue = options.potentialValue;
	};

	_.extend(SegmentPotential.prototype, Potential.prototype, {

		/**
		 * If the point (x, y) is close to the line (distance less than half thickness),
		 *   it will return the SegmentPotential's potential value.
		 */
		getPotential: function(x, y, time) {
			if (Utils.distanceFromSegment(x, y, this.start.x, this.start.y, this.end.x, this.end.y) <= this.thickness / 2)
				return this.potentialValue;
			else
				return 0;
		},

	});

	return SegmentPotential;
});