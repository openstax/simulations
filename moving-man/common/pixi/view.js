define(function(require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');
	var PIXI     = require('pixi');

	/**
	 * A View class that acts like the Backbone.View class, complete
	 *   with Backbone Events, but it's for a Pixi.js DisplayObject
	 *   instead of an HTML element.
	 */
	var PixiView = function(options) {
		this.initialize(options);
	};

	/**
	 * Let the prototype get extended by the Backbone.Events object
	 *   so we have all that nice event functionality.
	 */
	_.extend(PixiView.prototype, Backbone.Events, {

		/**
		 * Field variables
		 */
		displayObject: null,

		/**
		 *
		 */
		initialize: function(options) {

		}

	});

	return PixiView;
});