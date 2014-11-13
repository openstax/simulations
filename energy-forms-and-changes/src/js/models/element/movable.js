define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Vector2  = require('vector2');

	var Element = require('models/element');

	/**
	 * 
	 */
	var MovableElement = Element.extend({

		defaults: {
			// Physical properties
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
			this.set('verticalVelocity', 0);

			Element.prototype.reset.apply(this);
		},

		setX: function(x) {
			this.get('position').x = x;
			this.set('position', this.get('position'));
		}

	});

	return MovableElement;
});
