define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AtomicState            = require('common/quantum/models/atomic-state');
    var PhysicsUtil            = require('common/quantum/models/physics-util');
    var Photon                 = require('common/quantum/models/photon');
    var EnergyEmissionStrategy = require('common/quantum/models/energy-emission-strategy');

    var Constants = require('../constants');
    var groundStateEnergy = -13.6;

    /**
     * Emission strategy just for this
     */
    var EmissionStrategy = EnergyEmissionStrategy.extend({

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
