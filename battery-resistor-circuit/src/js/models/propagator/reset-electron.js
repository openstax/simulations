define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * Resets all particle collisions
     */
    var ResetElectronPropagator = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(ResetElectronPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            particle.forgetCollision();
        }

    });

    return ResetElectronPropagator;
});
