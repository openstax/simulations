define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Vector2  = require('vector2-node');

	var Thermometer = require('models/element/thermometer');
	var EFCIntroSimulation = require('models/simulation/intro');

	/**
	 * Constants
	 */
	var Constants = require('models/constants');

	/**
	 * 
	 */
	var ElementFollowingThermometer = Thermometer.extend({

		initialize: function(attributes, options) {
			this.__super__.initialize.apply(this, arguments);

			if (!(this.elementLocator instanceof EFCIntroSimulation))
				throw 'ElementFollowingThermometer: elementLocator must be an EFCIntroSimulation';

			this.followedElement = null;
			this.followingOffset = new Vector2();

			this.on('change:userControlled', function(model, userControlled) {
				if (userControlled) {
					// Stop following anything
					this.stopFollowing();
				}
				else {
					var element = this.elementLocator.getElementAtLocation(this.get('position'));
					if (element)
						this.follow(element);
				}
			});
		},

		reset: function() {
			this.elementFollower.stopFollowing();
			this.__super__.reset.apply(this);
		},

		follow: function(element) {
			this.followedElement = element;
			this.listenTo(this.followedElement, 'change:position', function(model, position) {
				this.get('position')
					.set(position)
					.add(this.followingOffset);
			});
			this.followingOffset
				.set(this.get('position'))
				.sub(this.followedElement.get('position'));
		},

		stopFollowing: function() {
			if (this.followedElement)
				this.stopListening(this.followedElement);
		},



	});

	return ElementFollowingThermometer;
});
