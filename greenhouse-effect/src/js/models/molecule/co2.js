define(function (require) {

    'use strict';

    var PhotonAbsorptionStrategy = require('models/photon-absorption-strategy');
    var Molecule                 = require('models/molecule');
    var CarbonAtom               = require('models/atom/carbon');
    var OxygenAtom               = require('models/atom/oxygen');
    var AtomicBond               = require('models/atomic-bond');

    var Constants = require('constants');

    var INITIAL_CARBON_OXYGEN_DISTANCE = 170; // In picometers

    // Deflection amounts used for the vibration of the CO2 atoms.
    //   These are calculated such that the actual center of
    //   gravity should remain constant.
    var CARBON_MAX_DEFLECTION = 40;
    var OXYGEN_MAX_DEFLECTION = CarbonAtom.MASS * CARBON_MAX_DEFLECTION / (2 * OxygenAtom.MASS);

    /**
     * Represents a methane molecule.
     */
    var CO2 = Molecule.extend({

        initialize: function(attributes, options) {
            Molecule.prototype.initialize.apply(this, arguments);

            // Create and add atoms
            this.carbonAtom  = this.addAtom(new CarbonAtom());
            this.oxygenAtom1 = this.addAtom(new OxygenAtom());
            this.oxygenAtom2 = this.addAtom(new OxygenAtom());

            // Create and add bonds
            this.addAtomicBond(new AtomicBond(this.carbonAtom, this.oxygenAtom1, 2));
            this.addAtomicBond(new AtomicBond(this.carbonAtom, this.oxygenAtom2, 2));

            // Set up the photon wavelengths to absorb.
            this.addPhotonAbsorptionStrategy(Constants.IR_WAVELENGTH, new PhotonAbsorptionStrategy.VibrationStrategy(this));

            // Set the initial offsets.
            this.initAtomOffsets();
        },

        /**
         * Initialize sthe offsets from the center of gravity for each atom
         *   within this molecule.  This should be in the "relaxed" (i.e.
         *   non-vibrating) state.
         */
        initAtomOffsets: function() {
            this.getInitialAtomCogOffset(this.carbonAtom).set(0, 0);
            this.getInitialAtomCogOffset(this.oxygenAtom1).set( INITIAL_CARBON_OXYGEN_DISTANCE, 0);
            this.getInitialAtomCogOffset(this.oxygenAtom2).set(-INITIAL_CARBON_OXYGEN_DISTANCE, 0);

            this.updateAtomPositions();
        },

        /**
         * Set the angle, in terms of radians from 0 to 2*PI, where this
         *   molecule is in its vibration sequence.
         */
        vibrate: function(vibrationRadians) {
            Molecule.prototype.vibrate.apply(this, arguments);

            var multFactor = Math.sin(vibrationRadians);
            this.getInitialAtomCogOffset(this.carbonAtom).set(0, multFactor * CARBON_MAX_DEFLECTION);
            this.getInitialAtomCogOffset(this.oxygenAtom1).set( INITIAL_CARBON_OXYGEN_DISTANCE, -multFactor * OXYGEN_MAX_DEFLECTION);
            this.getInitialAtomCogOffset(this.oxygenAtom2).set(-INITIAL_CARBON_OXYGEN_DISTANCE, -multFactor * OXYGEN_MAX_DEFLECTION);

            this.updateAtomPositions();
        }

    });

    return CO2;
});
