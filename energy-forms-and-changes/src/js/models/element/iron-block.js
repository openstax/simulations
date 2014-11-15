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
	Static.SPECIFIC_HEAT = 450; // In J/kg-K, source = design document.
	Static.DENSITY = 7800; // In kg/m^3, source = design document

	/**
	 * 
	 */
	var IronBlock = Block.extend({

		defaults: _.extend({}, Block.prototype.defaults, {
			energyContainerCategory: EnergyContainerCategory.IRON
		})

	}, Static);

	return IronBlock;
});
