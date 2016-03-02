define(function (require) {

    'use strict';

    var _ = require('underscore');

    var EnergyAbsorptionStrategy = require('./energy-absorption-strategy');

    var Constants = require('constants');
  
    /**
     * Pick a state between that of the next higher energy state and the highest energy state
     *   that could be reached given the energy of the electron hitting the atom. The 
     *   likelihood of any of those states being selected is the same.
     * 
     * Assumes that the atom's array of states is sorted in ascending order of energy.
     */
    var EqualLikelihoodAbsorptionStrategy = function() {
        EnergyAbsorptionStrategy.apply(this, arguments);
    };

    _.extend(EqualLikelihoodAbsorptionStrategy.prototype, EnergyAbsorptionStrategy.prototype, {

        /**
         * If the electron's energy is greater than the difference between the atom's current energy and one of
         * its higher energy states, the atom absorbs some of the electron's energy and goes to a state higher
         * in energy by the amount it absorbs. The state chosen is determined according the the description in
         * the class header.
         *
         * @param electron
         */
        collideWithElectron: function(atom, electron) {
            var states = atom.getStates();
            var currState = atom.getCurrentState();
            var electronEnergy = this.getElectronEnergyAtCollision(atom, electron);

            // Find the index of the current state
            var currStateIdx;
            for (currStateIdx = 0; currStateIdx < states.length; currStateIdx++) {
                if (states[currStateIdx] === currState)
                    break;
            }

            // Find the index of the highest energy state whose energy is not higher than that of the
            //   current state by more than the energy of the electron
            var highestPossibleNewStateIdx;
            for (highestPossibleNewStateIdx = currStateIdx + 1; highestPossibleNewStateIdx < states.length; highestPossibleNewStateIdx++) {
                if (states[highestPossibleNewStateIdx].get('energyLevel') - currState.get('energyLevel') > electronEnergy)
                    break;
            }
            highestPossibleNewStateIdx--;

            // Pick a state between that of the next higher energy state and the highest energy state
            //   we found in the preceding block. The highest state has a 50% chance of being picked,
            //   and all other states have equal probablity within the remaining 50%
            if (highestPossibleNewStateIdx > currStateIdx) {
                var rand = Math.floor(Math.random() * (highestPossibleNewStateIdx - currStateIdx)) + 1;
                var newStateIdx = rand + currStateIdx;
                var newState = states[newStateIdx];

                // Put the atom in the randomly picked state, and reduce the energy of the electron by the difference
                //   in energy between the new state and the old state
                var energyDiff = newState.get('energyLevel') - currState.get('energyLevel');
                atom.setCurrentState(newState);
                electron.setEnergy(electronEnergy - energyDiff);
            }
        }

    });


    return EqualLikelihoodAbsorptionStrategy;
});