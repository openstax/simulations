define(function (require) {

	'use strict';

	var _ = require('underscore');

	var Block = require('models/element/block');

	/**
	 * Constants
	 */
	var Constants = require('constants');
	var EnergyContainerCategory = Constants.EnergyContainerCategory;

	/**
	 * 
	 */
	var IronBlock = Block.extend({

		defaults: _.extend({}, Block.prototype.defaults, {
			energyContainerCategory: EnergyContainerCategory.IRON,

			density:      Constants.Iron.DENSITY,
			specificHeat: Constants.Iron.SPECIFIC_HEAT
		})

	}, Constants.Iron);

	return IronBlock;
});
