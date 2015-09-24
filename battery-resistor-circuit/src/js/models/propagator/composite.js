define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * This matches the high end of a and the low end of b.
     */
    var CompositePropagator = function() {
        this.propagators = [];
    };

    /**
     * Instance functions/properties
     */
    _.extend(CompositePropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            for (var i = 0; i < this.propagators.length; i++)
                this.propagators[i].propagate(deltaTime, particle);
        },

        add: function(propagator) {
            this.propagators.push(propagator);
        }

    });

    return CompositePropagator;
});
