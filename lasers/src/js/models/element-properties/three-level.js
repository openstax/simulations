define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PhysicsUtil            = require('common/quantum/models/physics-util');
    var Photon                 = require('common/quantum/models/photon');
    var EnergyEmissionStrategy = require('common/quantum/models/energy-emission-strategy');

    var LaserElementProperties = require('../laser-element-properties');
    
    var Constants = require('../../constants');
    var groundStateEnergy = -13.6;

    /**
     * Emission strategy just for this
     */
    var EmissionStrategy = function() {
        EnergyEmissionStrategy.apply(this, arguments);
    };

    _.extend(EmissionStrategy.prototype, EnergyEmissionStrategy.prototype, {

        emitEnergy: function(atom) {
            return atom.getCurrentState().getNextLowerEnergyState();
        }

    });

    /**
     * ElementProperties for the 2 level atom in the laser simulation
     */
    var ThreeLevelElementProperties = LaserElementProperties.extend({

        defaults: _.extend(LaserElementProperties.prototype.defaults, {
            name: 'Laser Atom',
            meanStateLifetime: (Constants.DT / Constants.FPS) * 100,
            energyLevels: [
                groundStateEnergy,
                groundStateEnergy + PhysicsUtil.wavelengthToEnergy(Photon.RED),
                groundStateEnergy + PhysicsUtil.wavelengthToEnergy(Photon.BLUE)
            ],
            energyEmissionStrategy: new EmissionStrategy()
        }),

        getHighEnergyState: function() {
            return this.states[2];
        }

    });


    return ThreeLevelElementProperties;
});
