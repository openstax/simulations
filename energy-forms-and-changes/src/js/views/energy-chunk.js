define(function(require) {

	'use strict';

	//var _    = require('underscore');
	//var PIXI = require('pixi');

	var PixiView = require('common/pixi/view');

	/**
	 * A view that represents the air model
	 */
	var EnergyChunkView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {

		},

		update: function(time, deltaTime) {
			//this.displayObject.rotation += deltaTime * 0.0001;
		}

	});

	return EnergyChunkView;
});