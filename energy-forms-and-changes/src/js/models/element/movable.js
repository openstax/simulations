define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');
	var Vector2  = require('vector2');

	var Element = require('models/element');

	/**
	 * 
	 */
	var MovableElement = Element.extend({

		defaults: {
			// Dynamic physical properties
			position: null,
			verticalVelocity: 0,
			
			// State properties
			userControlled: false,
		},
		
		initialize: function(attributes, options) {
			// Create vectors
			this.set('position', new Vector2(0, 0));
		},

		reset: function() {
			this.set('userControlled', true);
			this.set('position', this.get('position').set(0, 0));
		}

	});

	return MovableElement;
});
