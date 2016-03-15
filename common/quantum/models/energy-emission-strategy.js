define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');
    
    /**
     * Strategy for atoms emitting energy
     */
    var EnergyEmissionStrategy = function() {};

    _.extend(EnergyEmissionStrategy.prototype, {

        emitEnergy: function(atom) {}

    });

    EnergyEmissionStrategy.extend = Backbone.Model.extend;

    return EnergyEmissionStrategy;
});
