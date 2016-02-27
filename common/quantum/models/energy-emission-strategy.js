define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Emission strategy for atomic states
     */
    var EnergyEmissionStrategy = Backbone.Model.extend({

        emitEnergy: function(atom) {}

    });


    return EnergyEmissionStrategy;
});
