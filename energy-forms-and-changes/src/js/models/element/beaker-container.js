define(function (require) {

	'use strict';

	var _ = require('underscore');

	var Beaker = require('models/element/beaker');

	/**
	 * 
	 */
	var BeakerContainer = Beaker.extend({

		initialize: function(attributes, options) {
			options || (options = {});

			Beaker.prototype.initialize.apply(this, [attributes, options]);

			this.potentiallyContainedElements = options.potentiallyContainedElements || [];
		},

		/*
		 * Update the fluid level in the beaker based upon any displacement that
		 * could be caused by the given rectangles.  This algorithm is strictly
		 * two dimensional, even though displacement is more of the 3D concept.
		 */
		updateFluidLevel: function(potentiallyDisplacingRectangles) {
			// Calculate the amount of overlap between the rectangle that
			//   represents the fluid and the displacing rectangles.
			var fluidRectangle = this._fluidRect.set(
			    this.get('position').x,
			    this.get('position').y,
			    this.get('width'),
			    this.get('height') * this.get('fluidLevel')
			);
			
		}

	});

	return BeakerContainer;
});
