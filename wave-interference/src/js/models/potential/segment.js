
define(function(require) {

	'use strict';

	var _         = require('underscore');
	var Utils     = require('../../utils/utils');
	var Potential = require('../potential.js');

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
			potentialValue: 100,
			enabled: true
		}, options);

		this.start = options.start;
		this.end   = options.end;

		this.thickness = options.thickness;

		this.potentialValue = options.potentialValue;

		this.enabled = options.enabled;
	};

	_.extend(SegmentPotential.prototype, Potential.prototype, {

		/**
		 * If the point (x, y) is close to the line (distance less than half thickness),
		 *   it will return the SegmentPotential's potential value.
		 */
		getPotential: function(x, y, time) {
			if (!this.enabled)
				return 0;

			if (Utils.distanceFromSegment(x, y, this.start.x, this.start.y, this.end.x, this.end.y) <= this.thickness / 2)
				return this.potentialValue;
			else
				return 0;
		},

		getNormalUnitVector: function() {
			return Utils.normalVectorFromLine(this.start.x, this.start.y, this.end.x, this.end.y);
		},

		/**
		 * Returns angle of line in degrees where zero is pointing to the right and goes clockwise
		 */
		getAngle: function() {
			return Utils.angleFromLine(this.start.x, this.start.y, this.end.x, this.end.y);
		}

	});

	return SegmentPotential;
});