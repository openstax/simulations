define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Vector2  = require('common/math/vector2');

    var Thermometer = require('models/element/thermometer');

    /**
     * 
     */
    var ElementFollowingThermometer = Thermometer.extend({

        initialize: function(attributes, options) {
            Thermometer.prototype.initialize.apply(this, arguments);

            if (typeof this.elementLocator.getBeaker !== 'function' ||
                typeof this.elementLocator.getBlockList !== 'function')
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
            Thermometer.prototype.reset.apply(this);
        },

        follow: function(element) {
            this.followedElement = element;
            this.listenTo(this.followedElement, 'change:position', function(model, position) {
                this.setPosition(position.x + this.followingOffset.x, position.y + this.followingOffset.y);
            });
            this.followingOffset
                .set(this.get('position'))
                .sub(this.followedElement.get('position'));
        },

        stopFollowing: function() {
            if (this.followedElement) {
                this.stopListening(this.followedElement);
                this.followedElement = null;
            }
        }

    });

    return ElementFollowingThermometer;
});
