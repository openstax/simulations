define(function (require) {

	'use strict';

	var _ = require('underscore');

	var MovableElement = require('models/element');

	/**
	 * Constants
	 */
	var Constants = require('models/constants');

	/**
	 * 
	 */
	var Thermometer = MovableElement.extend({

		defaults: _.extend({}, MovableElement.prototype.defaults, {
			sensedTemperature: Constants.ROOM_TEMPERATURE,
			sensedElement: null,

			// Used primarily to control visibility in the view
			active: false,

			// If it's attached to an object, we just ask for the object's overall
			//   temperature, but if it's unattached, we make sure to request the
			//   temperature at a specific location.
			attached: false
		}),
		
		initialize: function(attributes, options) {
			options = options || {};

			if (options.elementLocator)
				this.elementLocator = options.elementLocator;
			else
				throw 'Thermometer model requires an element locator.';

			this.initiallyActive = this.get('active');
		},

		update: function(time, deltaTime) {
			this.set('sensedElement', this.elementLocator.getElementAtLocation(this.get('position')));
			if (this.get('sensedElement')) {
				if (this.get('attached'))
					this.set('sensedTemperature', this.get('sensedElement').getTemperature());
				else
					this.set('sensedTemperature', this.get('sensedElement').getTemperatureAtLocation(this.get('position')));
			}
		},

		reset: function() {
			this.set('active', this.initiallyActive);
		},

		getBottomSurface: function() {
			// Doesn't have a bottom surface, and can't be set on anything.
			return null;
		}

	});

	return Thermometer;
});
