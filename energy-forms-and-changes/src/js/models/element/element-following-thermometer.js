define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Vector2  = require('vector2-node');

	var Thermometer = require('models/element/thermometer');
	var IntroSimulation = require('models/simulation/intro');

	/**
	 * 
	 */
	var ElementFollowingThermometer = Thermometer.extend({

		initialize: function(attributes, options) {
			this.__super__.initialize.apply(this, arguments);

			if (!(this.elementLocator instanceof IntroSimulation))
				throw 'ElementFollowingThermometer: elementLocator must be an IntroSimulation';
			else
				this.simulation = this.elementLocator;

			this.followedElement = null;
			this.followingOffset = new Vector2();

			this.on('change:userControlled', function(model, userControlled) {
				if (userControlled) {
					// Stop following anything
					this.stopFollowing();
				}
				else {
					// The user has dropped this thermometer.  See if it was
                    //   dropped over something that it should follow.
                    _.each(this.simulation.getBlockList(), function(block) {
                    	if (block.getProjectedShape().contains(this.get('position'))) {
                    		// Stick to this block.
                    		this.follow(block);
                    	}
                    }, this);
					if (!this.followedElement && this.simulation.getBeaker().getThermalContactArea().getBounds().contains(this.get('position'))) {
						// Stick to the beaker.
						this.follow(this.simulation.getBeaker());
					}
				}
			});
		},

		reset: function() {
			this.stopFollowing();
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
		}

	});

	return ElementFollowingThermometer;
});
