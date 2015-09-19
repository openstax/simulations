define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Propagator = require('models/propagator');

    /**
     * 
     */
    var BoundsBouncePropagator = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(BoundsBouncePropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            if (this.isOutOfBounds(particle.get('position'))) {
                particle.setVelocity(this.getNewVelocity(particle.get('velocity')));
                particle.setPosition(this.getPointAtBounds(particle.get('position')));
                particle.setAcceleration(0, 0);
            }
        },

        isOutOfBounds: function(position) {},

        getPointAtBounds: function(oldPosition) {},

        getNewVelocity: function(oldVelocity) {}

    });

    return BoundsBouncePropagator;
});
