define(function (require) {

	'use strict';

	var _ = require('underscore');

	var Block = require('models/element/block');

	/**
	 * Constants
	 */
	var Constants = require('models/constants');
	var EnergyContainerCategory = Constants.EnergyContainerCategory;

	/**
	 * 
	 */
	var IronBlock = Block.extend({

		defaults: _.extend({}, Block.prototype.defaults, {
			energyContainerCategory: EnergyContainerCategory.IRON
		})

	}, Constants.Iron);

	return IronBlock;
});
