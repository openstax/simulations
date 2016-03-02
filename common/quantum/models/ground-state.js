define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var AtomicState = require('./atomic-state');

    /**
     * The ground state for an atom
     */
    var GroundState = AtomicState.extend({

        defaults: _.extend({}, AtomicState.prototype.defaults, {
            energyLevel: 0,
            meanLifetime: Number.POSITIVE_INFINITY
        }),

        getNextLowerEnergyState: function() {
            return AtomicState.MinEnergyState.instance();
        }

    });


    return GroundState;
});
