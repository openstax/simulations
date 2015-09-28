define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * A container for multiple propagators that runs its children in sequence.
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

        addPropagator: function(propagator) {
            this.propagators.push(propagator);
        }

    });

    return CompositePropagator;
});
