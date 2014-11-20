define(function (require) {

	'use strict';

	var _         = require('underscore');
	var Vector2   = require('vector2-node');
	var Rectangle = require('rectangle-node');

	var PiecewiseCurve         = require('common/math/piecewise-curve');
	var MovableElement         = require('models/element/movable');
	var EnergyChunkDistributor = require('models/energy-chunk-distributor');

	/**
	 * Constants
	 */
	var Constants = require('models/constants');

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

			energyContainerCategory: null,
			
			// State properties
			energyChunksVisible: false
		}),
		
		initialize: function(attributes, options) {
			this.__super__.initialize.apply(this, [attributes, options]);
			
			// Calculate starting energy
			this.set('energy', this.mass * this.specificHeat * Constants.ROOM_TEMPERATURE);

			// Slices: 2D "slices" of the container, used for 3D layering of energy chunks.
			this.slices = [];
			this.addEnergyChunkSlices();
			this.nextSliceIndex = this.slices.length / 2;

			// Energy chunks that are approaching this model element
			this.approachingEnergyChunks = [];
			this.energyChunkWanderControllers = [];

			// Add the initial energy chunks
			this.addInitialEnergyChunks();

			this._sliceBounds = new Rectangle();
			this._centerPoint = new Vector2();
			this._translation = new Vector2();
			this._vec2 = new Vector2();
			this._forwardPerspectiveOffset  = Constants.MAP_Z_TO_XY_OFFSET( Constants.Block.SURFACE_WIDTH / 2);
			this._backwardPerspectiveOffset = Constants.MAP_Z_TO_XY_OFFSET(-Constants.Block.SURFACE_WIDTH / 2);

			this.on('change:position', function(model, position){
				var translation = this._translation.set(position).sub(this._oldPosition);
				_.each(this.slices, function(slice) {
					_.each(slice.energyChunkList, function(chunk) {
						chunk.translate(translation);
					});
				});
			});
		},

		reset: function() {
			MovableElement.prototype.reset.apply(this);

			this.set('energy', this.mass * this.specificHeat * Constants.ROOM_TEMPERATURE);
			this.addInitialEnergyChunks();
		},

		update: function(time, delta) {
			// Distribute the energy chunks contained within this element.
			EnergyChunkDistributor.updatePositions(this.slices, delta);

			// Animate the energy chunks that are outside this element.
			this.animateUncontainedEnergyChunks(delta);
		},

		getRect: function() {},

		changeEnergy: function(deltaEnergy) {
			this.set('energy', this.get('energy') + deltaEnergy);
		},

		getTemperature: function() {
			return this.get('energy') / (this.get('mass') * this.get('specificHeat'));
		},

		getTemperatureAtLocation: function(location) {
			return this.getTemperature();
		},

		animateUncontainedEnergyChunks: function(deltaTime) {
			_.each(this.energyChunkWanderControllers, function(energyChunkWanderController) {
				energyChunkWanderController.updatePosition(deltaTime);
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
				this.energyChunkWanderControllers.push(new EnergyChunkWanderController(chunk, this.get('position')));
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
				sliceBounds = this.slices[i].getBounds();

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

			// Fail safe - If nothing found, get the first chunk.
			if (!chunkToExtract) {
				console.error(Object.prototype.toString.call(this) + ' - Warning: No energy chunk found by extraction algorithm, trying first available.');
				for (var i = 0; i < this.slices.length; i++) {
					if (this.slices[i].energyChunkList.length) {
						chunkToExtract = this.slices[i].energyChunkList[0];
						break;
					}
				}
				if (!chunkToExtract)
					console.error(Object.prototype.toString.call(this) + ' - Warning: No chunks available for extraction.');
			}

			this.removeEnergyChunk(chunkToExtract);
			return chunkToExtract;
		},

		/**
		 * Initialization method that add the "slices" where the energy chunks
		 * reside.  Should be called only once at initialization.
		 */
		addEnergyChunkSlices: function() {
			// Make sure this method isn't being misused.
			if (this.slices.length)
				return;

			// Defaults to a single slice matching the outline rectangle, override
			//   for more sophisticated behavior.
			this.slices.push(new EnergyChunkContainerSlice(this.getRect(), 0, this.get('position')));
		},

		addInitialEnergyChunks: function() {
			_.each(this.slices, function(slice) {
				slice.energyChunkList = [];
			});
			var targetNumChunks = Constants.ENERGY_TO_NUM_CHUNKS_MAPPER(this.get('energy'));
			var energyChunkBounds = this.getThermalContactArea().getBounds();
			var numChunks = this.getNumEnergyChunks();
			while (numChunks < targetNumChunks) {
				// Add a chunk at a random location in the block.
				this.addEnergyChunk(new EnergyChunk(
					EnergyChunk.THERMAL, 
					EnergyChunkDistributor.generateRandomLocation(energyChunkBounds), 
					this.get('energyChunksVisible')
				));
				numChunks++;
			}

			// Distribute the energy chunks within the container.
			for (var i = 0; i < 1000; i++) {
				if (!EnergyChunkDistributor.updatePositions(this.slices, Constants.SIM_TIME_PER_TICK_NORMAL))
					break;
			}
		},

		getNumEnergyChunks: function() {
			var numChunks = 0;
			for (var i = 0; i < this.slices.length; i++)
				numChunks += this.slices[i].getNumEnergyChunks();
			return numChunks + approachingEnergyChunks.size();
		},

		/**
		 * Exchanges energy with another energy container.
		 */
		exchangeEnergyWith: function(other, delta) {
			var thermalContactLength = this.getThermalContactArea().getThermalContactLength(other.getThermalContactArea());
			if (thermalContactLength > 0) {
				if (Math.abs(other.getTemperature() - this.getTemperature()) > Constants.TEMPERATURES_EQUAL_THRESHOLD) {
					// Exchange energy between this and the other energy container.
					var heatTransferConstant = Constants.HeatTransfer.getHeatTransferFactor(this.get('energyContainerCategory'), other.get('energyContainerCategory'));
					var numFullTimeStepExchanges = Math.floor(delta / Constants.MAX_HEAT_EXCHANGE_TIME_STEP);
					var leftoverTime = delta - (numFullTimeStepExchanges * Constants.MAX_HEAT_EXCHANGE_TIME_STEP);
					var timeStep;
					var thermalEnergyGained;
					for (var i = 0; i < numFullTimeStepExchanges + 1; i++) {
						timeStep = i < numFullTimeStepExchanges ? Constants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
						thermalEnergyGained = (other.getTemperature() - this.getTemperature()) * thermalContactLength * heatTransferConstant * timeStep;
	                    other.changeEnergy(-thermalEnergyGained);
	                    this.changeEnergy(thermalEnergyGained);
					}
				}
			}
		},

		/*
		 * Get the shape as is is projected into 3D in the view.  Ideally, this
		 * wouldn't even be in the model, because it would be purely handled in the
		 * view, but it proved necessary.
		 */
		getProjectedShape: function() {
			var path = new PiecewiseCurve();
			var rect = this.getRect();
			var vec2 = this._vec2;

			path.moveTo(vec2.set(rect.x,       rect.y    ).add(this._forwardPerspectiveOffset));
			path.lineTo(vec2.set(rect.right(), rect.y    ).add(this._forwardPerspectiveOffset));
			path.lineTo(vec2.set(rect.right(), rect.y    ).add(this._backwardPerspectiveOffset));
			path.lineTo(vec2.set(rect.right(), rect.top()).add(this._backwardPerspectiveOffset));
			path.lineTo(vec2.set(rect.left(),  rect.top()).add(this._backwardPerspectiveOffset));
			path.lineTo(vec2.set(rect.left(),  rect.top()).add(this._forwardPerspectiveOffset));
			path.closePath();

			return path;
		},

		getCenterPoint: function() {
			return this._centerPoint.set(this.get('position').x, this.get('position').y + this.get('height') / 2);
		},

		/**
		 * Get a number indicating the balance between the energy level and the
		 * number of energy chunks owned by this model element.
		 *
		 * @return 0 if the number of energy chunks matches the energy level, a
		 *         negative value if there is a deficit, and a positive value if there is
		 *         a surplus.
		 */
		getEnergyChunkBalance: function() {
			this.getNumEnergyChunks() - Constants.ENERGY_TO_NUM_CHUNKS_MAPPER(this.get('energy'));
		},

		getThermalContactArea: function() {}

	});

	return RectangularThermalMovableElement;
});
