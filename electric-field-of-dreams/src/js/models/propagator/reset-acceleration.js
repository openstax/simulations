define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * Keeps a particle within four bounding walls.
     */
    var ResetAccelerationPropagator = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(ResetAccelerationPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            particle.setAcceleration(0, 0);
        }

    });

    return ResetAccelerationPropagator;
});
