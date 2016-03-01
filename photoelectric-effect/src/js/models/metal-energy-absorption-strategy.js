define(function (require) {

    'use strict';

    var _ = require('underscore');

    var EnergyAbsorptionStrategy = require('discharge-lamps/models/energy-absorption-strategy');

    var Constants = require('constants');

    var NUM_SUB_LEVELS     = Constants.MetalEnergyAbsorptionStrategy.NUM_SUB_LEVELS;
    var TOTAL_ENERGY_DEPTH = Constants.MetalEnergyAbsorptionStrategy.TOTAL_ENERGY_DEPTH;
  
    /**
     * Models the way that electrons are knocked off a metal when it is hit by a photon.
     *   The highest energy level has a number of sub-levels that are evenly spaced. When
     *   a photon hits the metal, it hits an electron in a randlomly selected sub-level.
     *   The energy required to dislodge an electron is the material's work function plus
     *   the energy associated with the depth of the sub-level.
     */
    var MetalEnergyAbsorptionStrategy = function(workFunction) {
        EnergyAbsorptionStrategy.apply(this, arguments);

        this.workFunction = workFunction;
    };

    _.extend(MetalEnergyAbsorptionStrategy.prototype, EnergyAbsorptionStrategy.prototype, {

        collideWithElectron: function(atom, electron) {
            throw 'Not implemented';
        },

        energyAfterPhotonCollision: function(photon) {
            // Randomly pick one of the levels
            var level = Math.floor(Math.random() * NUM_SUB_LEVELS);
            // Determine the energy of the electron at that level
            var energyRequired = this.workFunction + (level * (TOTAL_ENERGY_DEPTH / NUM_SUB_LEVELS));
            return photon.getEnergy() - energyRequired;
        }

    });

    _.extend(MetalEnergyAbsorptionStrategy, Constants.MetalEnergyAbsorptionStrategy);


    return MetalEnergyAbsorptionStrategy;
});