define(function (require) {

	'use strict';

	var _         = require('underscore');
	var Vector2   = require('vector2-node');
	var Rectangle = require('rectangle-node');

	var MovableElement         = require('models/element/movable');
	var Constants              = require('models/constants');
	var EnergyChunkDistributor = require('models/energy-chunk-distributor');

	/**
	 * 
	 */
	var RectangularThermalMovableElement = MovableElement.extend({

		defaults: _.extend({}, MovableElement.prototype.defaults, {
			// Physical properties
			energy:       0, // in Joules
			specificHeat: 0, // in J/kg-K
			mass:         0, // in kg
			width:        0,
			height:       0,
			
			// State properties
			energyChunksVisible: false
		}),
		
		initialize: function(attributes, options) {
			
			// Calculate starting energy
			this.energy = this.mass * this.specificHeat * Constants.ROOM_TEMPERATURE;

			// Slices: 2D "slices" of the container, used for 3D layering of energy chunks.
			this.slices = [];
			this.addEnergyChunkSlices();
			this.nextSliceIndex = this.slices.length / 2;

			// Energy chunks that are approaching this model element
			this.approachingEnergyChunks = [];
			this.energyChunkWanderControllers = [];

			// Add the initial energy chunks
			this.addInitialEnergyChunks();

			this._sliceBounds = new Rectangle(0, 0, 0, 0);
		},

		reset: function() {
			MovableElement.prototype.reset.apply(this);

			this.energy = this.mass * this.specificHeat * Constants.ROOM_TEMPERATURE;
			THIS.addInitialEnergyChunks();
		},

		update: function(time, delta) {
			// Distribute the energy chunks contained within this element.
			EnergyChunkDistributor.updatePositions(this.slices, delta);

			// Animate the energy chunks that are outside this element.
			this.animateUncontainedEnergyChunks(delta);
		},

		getRect: function() {},

		changeEnergy: function(deltaEnergy) {
			this.energy += deltaEnergy;
		},

		getTemperature: function() {
			return this.energy / (this.mass * this.specificHeat);
		},

		animateUncontainedEnergyChunks: function(delta) {
			_.each(this.energyChunkWanderControllers, function(energyChunkWanderController) {
				energyChunkWanderController.updatePosition(delta);
				if (this.getSliceBounds().contains(energyChunkWanderController.getEnergyChunk().get('position')))
					this.moveEnergyChunkToSlices(energyChunkWanderController.getEnergyChunk());
			}, this);
		},

		/**
		 * Add an energy chunk to this model element.  The energy chunk can be
		 * outside of the element's rectangular bounds, in which case it is added
		 * to the list of chunks that are moving towards the element, or it can be
		 * positioned already inside, in which case it is immediately added to one
		 * of the energy chunk "slices".
		 *
		 * @param ec Energy chunk to add.
		 */
		addEnergyChunk: function(chunk) {
			if (this.getSliceBounds().contains(chunk.get('position'))) {
				// Energy chunk is positioned within container bounds, so add it
				//   directly to a slice.
				this.addEnergyChunkToNextSlice(chunk);
			}
			else {
				// Chunk is out of the bounds of this element, so make it wander
				//   towards it.
				chunk.zPosition = 0;
				this.approachingEnergyChunks.push(chunk);
				this.energyChunkWanderControllers.push(new EnergyChunkWanderController(chunk, this.position));
			}
		},

		/**
		 * Add an energy chunk to the next available slice.  Override for more 
		 *   elaborate behavior.
		 */
		addEnergyChunkToNextSlice: function(chunk) {
			this.slices[this.nextSliceIndex].addEnergyChunk(chunk);
			this.nextSliceIndex = (this.nextSliceIndex + 1) % this.slices.length;
		},

		getSliceBounds: function() {
			var minX = Number.POSITIVE_INFINITY;
			var minY = Number.POSITIVE_INFINITY;
			var maxX = Number.NEGATIVE_INFINITY;
			var maxY = Number.NEGATIVE_INFINITY;

			var sliceBounds;
			for (var i = 0; i < this.slices.length; i++) {
				sliceBounds = this.slices[i].bounds;

				if (sliceBounds.left() < minX)
					minX = sliceBounds.left();

				if (sliceBounds.right() < maxX)
					maxX = sliceBounds.right();

				if (sliceBounds.bottom() < minY)
					minY = sliceBounds.bottom();

				if (sliceBounds.top() < maxY)
					maxY = sliceBounds.top();
			}

			this._sliceBounds.x = minX;
			this._sliceBounds.y = minY;
			this._sliceBounds.width  = maxX - minX;
			this._sliceBounds.height = maxY - minY;

			return this._sliceBounds;
		},

		/**
		 * Takes an energy chunk out of the approaching energy chunks and
		 *   adds it to this element's slices.
		 */
		moveEnergyChunkToSlices: function(chunk) {
			// Remove the chunk from the approaching energy chunks
			this.approachingEnergyChunks.splice(_.indexOf(this.approachingEnergyChunks, chunk), 1);

			// Remove the chunk's controller
			for (var i = 0; i < this.energyChunkWanderControllers.length; i++) {
				if (this.energyChunkWanderControllers[i].getEnergyChunk() === chunk)
					this.energyChunkWanderControllers.splice(i, 1);
			}

			// Welcome it to the family
			this.addEnergyChunkToNextSlice(chunk);
		},

		removeEnergyChunk: function(chunk) {
			var index;
			for (var i = 0; i < this.slices.length; i++) {
				index = _.indexOf(this.slices[i].energyChunkList, chunk);
				if (index !== -1) {
					this.slices[i].energyChunkList.splice(index, 1);
					return true;
				}
			}
			return false;
		},

		
		extractClosestEnergyChunk: function(shape) {
			if (shape instanceOf Vector2)
				return this._extractClosestEnergyChunkToPoint(shape);
			else
				return this._extractClosestEnergyChunkToRectangle(shape);
		},

		/*
		 * Extract the closest energy chunk to the provided point.  Compensate
		 * distances for the z-offset so that z-positioning doesn't skew the
		 * results, since the provided point is only 2D.
		 *
		 * @param point Comparison point.
		 * @return Energy chunk, null if there are none available.
		 */
		_extractClosestEnergyChunkToPoint: function(point) {
			var closestEnergyChunk = null;
			var closestCompensatedDistance = Number.POSITIVE_INFINITY;

			var compensatedChunkPosition = new Vector2(0, 0);
			var compensatedDistance;

			// Indentify the closest energy chunk.
			_.each(this.slices, function(slice) {
				_.each(slice.energyChunkList, function(chunk) {
					// Compensate for the Z offset.  Otherwise front chunk will
					//   almost always be chosen.
					compensatedChunkPosition
						.set(chunk.position)
						.minus(0, Constants.Z_TO_Y_OFFSET_MULTIPLIER * chunk.zPosition);
					compensatedDistance = compensatedChunkPosition.distance(point);

					if (compensatedDistance < closestCompensatedDistance) {
						// For some reason in the original, closestCompensatedDistance 
						//   was never updated.  I think that was a logical error, so 
						//   I'm going to go ahead and update it.
						closestCompensatedDistance = compensatedDistance;
						closestEnergyChunk = chunk;
					}
				});
			});

			this.removeEnergyChunk(closestEnergyChunk);
			return closestEnergyChunk;
		},

		/*
		 * Extract an energy chunk that is a good choice for being transferred to
		 * the provided shape.  Generally, this means that it is close to the
		 * shape.  This routine is not hugely general - it makes some assumptions
		 * that make it work for blocks in beakers.  If support for other shapes is
		 * needed, it will need some work.
		 *
		 * @param rect
		 * @return Energy chunk, null if none are available.
		 */
		_extractClosestEnergyChunkToRectangle: function(rect) {
			var chunkToExtract = null;
			var myBounds = this.getSliceBounds();

			if (rect.contains(this.getThermalContactArea().getBounds())) {
				// Our shape is contained by the destination.  Pick a chunk near
				//   our right or left edge.
			}
			else if (this.getThermalContactArea().getBounds().contains(rect)) {
				// Our shape encloses the destination shape.  Choose a chunk that
				//   is close but doesn't overlap with the destination shape.
			}
			else {
				// There is no or limited overlap, so use center points.
				var center = rect.center();
				chunkToExtract = this._extractClosestEnergyChunkToPoint(new Vector2(center.x, center.y));
				if (chunkToExtract)
					return chunkToExtract;
			}
		},


		getThermalContactArea: function() {}

	});

	return RectangularThermalMovableElement;
});
