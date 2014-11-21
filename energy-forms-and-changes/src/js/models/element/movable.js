define(function (require) {

	'use strict';

	var Vector2 = require('vector2-node');

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
			if (!this.get('position'))
				this.set('position', new Vector2());
			this._oldPosition = new Vector2();
		},

		reset: function() {
			this.set('userControlled', true);
			this.set('position', this.get('position').set(0, 0));
			this.set('verticalVelocity', 0);

			Element.prototype.reset.apply(this);
		},

		setX: function(x) {
			this._oldPosition.set(this.get('position'));
			this.get('position').x = x;
			this.set('position', this.get('position'));
		}

	});

	return MovableElement;
});
