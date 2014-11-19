define(function (require) {

	'use strict';

	var _         = require('underscore');
	var Rectangle = require('rectangle-node');

	Rectangle.prototype.intersection = require('common/math/rectangle-intersection');

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
			var intersection;
			var overlappingArea = 0;
			_.each(this.potentiallyContainedElements, function(rectangle) {
				if (rectangle.overlaps(fluidRectangle)) {
					intersection = rectangle.intersection(fluidRectangle);
					overlappingArea += intersection.w * intersection.h;
				}
			});

			// Map the overlap to a new fluid height.  The scaling factor was
			//   empirically determined to look good.
			var newFluidLevel = Math.min(Beaker.INITIAL_FLUID_LEVEL + overlappingArea * 120, 1 );
			var proportionateIncrease = newFluidLevel / this.get('fluidLevel');
			this.set('fluidLevel', newFluidLevel);

			// Update the shapes of the energy chunk slices.
			_.each(this.slices, function(slice) {
				var originalBounds = this.slice.getShape().getBounds();
				slice.getShape()
					.scale(1, proportionateIncrease)
					.translate(
						originalBounds.x - slice.getShape().getBounds().x,
						originalBounds.y - slice.getShape().getBounds().y
					);
			});
		},

		

	});

	return BeakerContainer;
});
