define(function (require) {

    'use strict';

    var EnergyEmissionStrategy = require('common/quantum/models/energy-emission-strategy');
  
    /**
     * An energy emission strategy that always sets the atom to the ground state
     */
    var DefaultEnergyEmissionStrategy = EnergyEmissionStrategy.extend({

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