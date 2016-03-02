define(function (require) {

    'use strict';

    var _ = require('underscore');

    var ProbabilisticChooser   = require('common/math/probabilistic-chooser');
    var EnergyEmissionStrategy = require('common/quantum/models/energy-emission-strategy');

    var Constants = require('constants');
  
    /**
     * An energy emission strategy that always sets the atom to the ground state
     */
    var DefaultEnergyEmissionStrategy = function(transitionEntries) {
        EnergyEmissionStrategy.apply(this, arguments);
    };

    _.extend(DefaultEnergyEmissionStrategy.prototype, EnergyEmissionStrategy.prototype, {

        emitEnergy: function(atom) {
            var newState = null;
            var states = atom.getStates();
            
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                if (state instanceof GroundState)
                    newState = state;
            }

            return newState;
        }

    });


    return DefaultEnergyEmissionStrategy;
});