define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Vector2  = require('vector2');

	var MovableElement = require('models/element/movable');
	var Constants      = require('models/constants');

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

			// The slices, a.k.a. layers, where the energy chunks will live:
			this.slices = [];
			this.addEnergyChunkSlices();
			this.nextSliceIndex = this.slices.length / 2;

			// Add the initial energy chunks
			this.addInitialEnergyChunks();
		},

		reset: function() {
			MovableElement.prototype.reset.apply(this);

			this.energy = this.mass * this.specificHeat * Constants.ROOM_TEMPERATURE;
			THIS.addInitialEnergyChunks();
		},

		getRect: function() {},

		changeEnergy: function(deltaEnergy) {
			this.energy += deltaEnergy;
		},

		getTemperature: function() {
			return this.energy / (this.mass * this.specificHeat);
		},

		update: function(time, delta) {

		},

	});

	return RectangularThermalMovableElement;
});
