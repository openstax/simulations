define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(Propagator.prototype, {

        update: function(deltaTime, system) {
            for (var i = 0; i < system.particles.length; i++)
                this.propagate(deltaTime, system.particles.at(i));
        },

        propagate: function(deltaTime, particle) {
            throw 'Propagate function not yet implemented.';
        }

    });

    return Propagator;
});
