
define(function(require) {

	'use strict';

	var _         = require('underscore');
	var Potential = require('../potential');

	/**
	 * Named after PhET's BarrierPotential with the flexibility of WallPotential
	 */
	var BoxPotential = function(options) {

		Potential.apply(this, [options]);

		// Default values
		options = _.extend({
			x: 0,
			y: 0,
			width: 2,
			height: 2,
			potentialValue: 100,
			enabled: true
		}, options);

		this.x = options.x;
		this.y = options.y;

		this.width  = options.width;
		this.height = options.height;

		this.potentialValue = options.potentialValue;

		this.enabled = options.enabled;
	};

	_.extend(BoxPotential.prototype, Potential.prototype, {

		/**
		 * If the point (x, y) lies within the box, it will
		 *   return the BoxPotential's potential value.
		 */
		getPotential: function(x, y, time) {
			if (!this.enabled)
				return 0;
			
			if (x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height)
				return this.potentialValue;
			else
				return 0;
		},

	});

	return BoxPotential;
});