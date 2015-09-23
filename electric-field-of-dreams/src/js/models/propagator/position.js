define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * Keeps a particle within four bounding walls.
     */
    var PositionPropagator = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(PositionPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            particle.updatePositionFromVelocity(deltaTime);
        }

    });

    return PositionPropagator;
});
