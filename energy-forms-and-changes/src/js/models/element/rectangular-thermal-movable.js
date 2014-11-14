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

		},

	});

	return RectangularThermalMovableElement;
});
