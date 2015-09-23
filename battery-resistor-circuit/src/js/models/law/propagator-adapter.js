define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Law = require('models/law');

    /**
     * This class isn't actually necessary, but it explains within the system how
     *   a Propagator object can be placed in the laws array in the system...
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
