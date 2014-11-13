define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');

	/**
	 * Constants
	 */
	var Static = {};
	// 2D size of the air.  It is sized such that it will extend off the left,
	// right, and top edges of screen for the most common aspect ratios of the
	// view.
	Static.WIDTH  = 0.7; 
	Static.HEIGHT = 0.3;

	// The thickness of the slice of air being modeled.  This is basically the
	// z dimension, and is used solely for volume calculations.
	Static.DEPTH = 0.1; // In meters.

	// Constants that define the heat carrying capacity of the air.
	Static.SPECIFIC_HEAT = 1012; // In J/kg-K, source = design document.
	Static.DENSITY = 10; // In kg/m^3, far denser than real air, done to make things cool faster.

	// Derived constants.
	Static.VOLUME = WIDTH * HEIGHT * DEPTH;
	Static.MASS = VOLUME * DENSITY;
	Static.INITIAL_ENERGY = MASS * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE;
	Static.THERMAL_CONTACT_AREA = new ThermalContactArea( new Rectangle2D.Double( -WIDTH / 2, 0, WIDTH, HEIGHT ), true );

	/**
	 * 
	 */
	var Air = Backbone.Model.extend({

		defaults: {
			energy: Static.INITIAL_ENERGY,
			energyChunksVisible: false
		},
		
		initialize: function(attributes, options) {
			this.energyChunksList = [];
			this.energyCunkWanderControllers = [];
		},

		/**
		 * Reset the air model to its original state.
		 */
		reset: function() {
		   
		}

	}, Static);

	return Air;
});
