define(function (require) {

    'use strict';

    var _ = require('underscore');

    var ProbabilisticChooser   = require('common/math/probabilistic-chooser');
    var EnergyEmissionStrategy = require('common/quantum/models/energy-emission-strategy');

    var Constants = require('constants');
  
    /**
     * An energy emission strategy in which the probability of the atom going from
     *   one state to another is different for the transition from each level to
     *   every lower level.
     */
    var LevelSpecificEnergyEmissionStrategy = function(transitionEntries) {
        EnergyEmissionStrategy.apply(this, arguments);

        this.transitionEntries = transitionEntries;
        this.originStateToTargetStates = {}; // States stored by their .hashCode()
        this.statesSet = false;
    };

    _.extend(LevelSpecificEnergyEmissionStrategy.prototype, EnergyEmissionStrategy.prototype, {

        emitEnergy: function(atom) {
            var newState = this.getTargetState(atom.getCurrentState());
            return newState;
        },

        getTargetState: function(originState) {
            var targetMap = this.originStateToTargetStates[originState.hashCode()];
            if (!targetMap)
                throw 'LevelSpecificEnergyEmissionStrategy.getTargetState returned no target map';
            
            var targetState = targetMap.get();
            return targetState;
        },

        /**
         * Sets the states for the strategy. Builds the map that holds the ProbabilisticChooser
         *   for each state.
         */
        setStates: function(states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var probabilisticChooser = new ProbabilisticChooser();

                for (var j = 0; j < this.transitionEntries.length; j++) {
                    var te = this.transitionEntries[j];
                    if (i == te.sourceStateIndex)
                        probabilisticChooser.add(te.txStrength, states[this.transitionEntries[j].targetStateIndex]);
                }

                this.originStateToTargetStates[state.hashCode()] = probabilisticChooser;
            }

            this.statesSet = true;
        }

    });


    return LevelSpecificEnergyEmissionStrategy;
});