define(function (require) {

	'use strict';

	var _         = require('underscore');
	var Rectangle = require('rectangle-node');
	var Vector2   = require('vector2-node');

	Rectangle.prototype.intersection = require('common/math/rectangle-intersection');

	var Beaker = require('models/element/beaker');
	var EnergyChunkWanderController = require('models/energy-chunk-wander-controller');

	/**
	 * 
	 */
	var BeakerContainer = Beaker.extend({

		initialize: function(attributes, options) {
			options || (options = {});

			Beaker.prototype.initialize.apply(this, arguments);

			this.potentiallyContainedElements = options.potentiallyContainedElements || [];

			this._motionVector = new Vector2();
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
				var originalBounds = slice.getShape().getBounds();
				slice.getShape()
					.scale(1, proportionateIncrease)
					.translate(
						originalBounds.x - slice.getShape().getBounds().x,
						originalBounds.y - slice.getShape().getBounds().y
					);
			});
		},

		isEnergyChunkObscured: function(chunk) {
			var element;
			for (var i = 0; i < this.potentiallyContainedElements.length; i++) {
				element = this.potentiallyContainedElements[i];
				if (this.getThermalContactArea().getBounds().contains(element.getRect()) && element.getProjectedShape().contains(chunk.position))
					return true;
			}
			return false;
		},

		animateUncontainedEnergyChunks: function(deltaTime) {
			_.each(this.energyChunkWanderControllers, function(controller) {
				var chunk = controller.energyChunk;
				if (this.isEnergyChunkObscured(chunk)) {
					// This chunk is being transferred from a container in the
					//   beaker to the fluid, so move it sideways.
					var xVelocity = 0.05 * deltaTime * (this.getCenterPoint().x > chunk.position.x ? -1 : 1);
					var motionVector = this._motionVector.set(xVelocity, 0);
					chunk.translate(motionVector);
				}
				else {
					controller.updatePosition(deltaTime);
				}

				if (!this.isEnergyChunkObscured(chunk) && this.getSliceBounds().contains(chunk.position)) {
					// Chunk is in a place where it can migrate to the slices and
					//   stop moving.
					this.moveEnergyChunkToSlices(controller.energyChunk);
				}
			}, this);
		},

		addEnergyChunk: function(chunk) {
			if (this.isEnergyChunkObscured(chunk)) {
				// Chunk obscured by a model element in the beaker, probably
				//   because the chunk just came from the model element.
				chunk.zPosition = 0;
				this.approachingEnergyChunks.push(chunk);
				this.energyChunkWanderControllers.push(new EnergyChunkWanderController(chunk, this.get('position')));
			}
			else {
				this.__super__.addEnergyChunk.apply(this, [chunk]);
			}
		}

	});

	return BeakerContainer;
});
