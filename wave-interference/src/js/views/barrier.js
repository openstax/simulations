define(function (require) {

	'use strict';

	var _            = require('underscore');
	var PIXI         = require('pixi');
	var BoxPotential = reqiure('models/potential/box');

	var BarrierView = function(options) {

		// Default values
		options = _.extend({
			damping: {
				x: 20,
				y: 20
			},
		}, options);

		
	};

	return BarrierView;
});
