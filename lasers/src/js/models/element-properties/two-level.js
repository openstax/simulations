define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AtomicState            = require('common/quantum/models/atomic-state');
    var PhysicsUtil            = require('common/quantum/models/physics-util');
    var Photon                 = require('common/quantum/models/photon');
    var EnergyEmissionStrategy = require('common/quantum/models/energy-emission-strategy');

    var LaserElementProperties = require('../laser-element-properties');

    var Constants = require('../../constants');
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
    var TwoLevelElementProperties = LaserElementProperties.extend({

        defaults: _.extend(LaserElementProperties.prototype.defaults, {
            name: 'Laser Atom',
            meanStateLifetime: (Constants.DT / Constants.FPS) * 100,
            energyLevels: [
                groundStateEnergy, // Ground-state energy
                groundStateEnergy + PhysicsUtil.wavelengthToEnergy(Photon.RED)
            ],
            energyEmissionStrategy: new EmissionStrategy()
        }),

        // Because of the origianl poor design of the Lasers simulation, we're saddled
        //   with needing a third, high energy state, even though we shouldn't have one.
        dummyHighEnergyState: new AtomicState(),

        getHighEnergyState: function() {
            return this.dummyHighEnergyState;
        }

    });


    return TwoLevelElementProperties;
});
