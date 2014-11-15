define(function (require) {

	'use strict';

	var _ = require('underscore');

	var Block                   = require('models/block');
	var EnergyContainerCategory = require('models/energy-container-category');

	/**
	 * Constants
	 */
	var Constants = require('models/constants');
	var Static = {};
	Static.SPECIFIC_HEAT = 840; // In J/kg-K, source = design document.
	Static.DENSITY = 3300; // In kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable.

	// Some constants needed for energy chunk mapping.
	Static.ENERGY_AT_ROOM_TEMPERATURE = Math.pow(Block.SURFACE_WIDTH, 3) * Static.DENSITY * Static.SPECIFIC_HEAT * Constants.ROOM_TEMPERATURE; // In joules.
	Static.ENERGY_AT_WATER_FREEZING_TEMPERATURE = Math.pow(Block.SURFACE_WIDTH, 3) * Static.DENSITY * Static.SPECIFIC_HEAT * Constants.FREEZING_POINT_TEMPERATURE; // In joules.

	/**
	 * 
	 */
	var Brick = Block.extend({

		defaults: _.extend({}, Block.prototype.defaults, {
			energyContainerCategory: EnergyContainerCategory.BRICK;
		})

	}, Static);

	return Brick;
});
