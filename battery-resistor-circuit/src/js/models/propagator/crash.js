define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * Resets particles that have collided.
     */
    var CrashPropagator = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(CrashPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            if (particle.hasCollided()) {
                particle.velocity = 0;
                particle.collided = false;
            }
        }

    });

    return CrashPropagator;
});
