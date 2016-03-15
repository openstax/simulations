define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MetalEnergyAbsorptionStrategy = require('models/metal-energy-absorption-strategy');

    var Constants = require('constants');

    var NUM_SUB_LEVELS = Constants.MetalEnergyAbsorptionStrategy.NUM_SUB_LEVELS;
  
    /**
     * Provides a simplified model of how electrons are kicked off a metal by photons. All
     *   electrons are considered to be in the lowest sub-level of the highest energy band.
     */
    var SimpleEnergyAbsorptionStrategy = MetalEnergyAbsorptionStrategy.extend({

        energyAfterPhotonCollision: function(photon) {
            var energy = (Math.floor(Math.random() * NUM_SUB_LEVELS) !== 0) ? 
                Number.NEGATIVE_INFINITY : 
                photon.getEnergy() - this.workFunction;
            return energy;
        }

    });


    return SimpleEnergyAbsorptionStrategy;
});