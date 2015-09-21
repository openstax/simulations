define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Law = require('models/law');

    /**
     * 
     */
    var PropagatorLawAdapter = function(propagator) {
        this.propagator = propagator;
    };

    /**
     * Instance functions/properties
     */
    _.extend(PropagatorLawAdapter.prototype, Law.prototype, {

        update: function(deltaTime, system) {
            this.propagator.update(deltaTime, system);
        }

    });

    return PropagatorLawAdapter;
});
