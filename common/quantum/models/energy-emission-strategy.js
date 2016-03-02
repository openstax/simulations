define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    /**
     * Strategy for atoms emitting energy
     */
    var EnergyEmissionStrategy = function() {};

    _.extend(EnergyEmissionStrategy.prototype, {

        emitEnergy: function(atom) {}

    });

    return EnergyEmissionStrategy;
});
