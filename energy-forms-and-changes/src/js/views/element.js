define(function(require) {

	'use strict';

	//var _    = require('underscore');
	//var PIXI = require('pixi');

	var PixiView = require('common/pixi/view');
	//var Colors   = require('common/colors/colors');

	/**
	 * A view that represents an element model
	 */
	var ElementView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			
		},

		update: function(time, deltaTime) {
			this.displayObject.rotation += deltaTime * 0.0001;
		}

	});

	return ElementView;
});