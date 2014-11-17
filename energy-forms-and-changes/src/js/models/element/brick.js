define(function (require) {

	'use strict';

	var _ = require('underscore');

	var Block                   = require('models/block');
	var EnergyContainerCategory = require('models/energy-container-category');

	/**
	 * Constants
	 */
	var Constants = require('models/constants');

	/**
	 * 
	 */
	var Brick = Block.extend({

		defaults: _.extend({}, Block.prototype.defaults, {
			energyContainerCategory: EnergyContainerCategory.BRICK
		})

	}, Constants.Brick);

	return Brick;
});
