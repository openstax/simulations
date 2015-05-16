define(function (require) {

    'use strict';

    var PhotonAbsorptionStrategy = require('models/photon-absorption-strategy');
    var Molecule                 = require('models/molecule');
    var CarbonAtom               = require('models/atom/carbon');
    var OxygenAtom               = require('models/atom/oxygen');
    var AtomicBond               = require('models/atomic-bond');

    var Constants = require('constants');

    var INITIAL_CARBON_OXYGEN_DISTANCE = 170; // In picometers
    var VIBRATION_MAGNITUDE = 20;             // In picometers

    /**
     * Represents a methane molecule.
     */
    var CO = Molecule.extend({

        initialize: function(attributes, options) {
            Molecule.prototype.initialize.apply(this, arguments);

            // Create and add atoms
            this.carbonAtom = this.addAtom(new CarbonAtom());
            this.oxygenAtom = this.addAtom(new OxygenAtom());

            // Create and add bonds
            this.addAtomicBond(new AtomicBond(this.carbonAtom, this.oxygenAtom, 3));

            // Set up the photon wavelengths to absorb.
            this.addPhotonAbsorptionStrategy(Constants.MICRO_WAVELENGTH, new PhotonAbsorptionStrategy.RotationStrategy(this));
            this.addPhotonAbsorptionStrategy(Constants.IR_WAVELENGTH,    new PhotonAbsorptionStrategy.VibrationStrategy(this));

            // Set the initial offsets.
            this.initAtomOffsets();
        },

        /**
         * Initialize sthe offsets from the center of gravity for each atom
         *   within this molecule.  This should be in the "relaxed" (i.e.
         *   non-vibrating) state.
         */
        initAtomOffsets: function() {
            this.getInitialAtomCogOffset(this.carbonAtom).set(-INITIAL_CARBON_OXYGEN_DISTANCE / 2, 0);
            this.getInitialAtomCogOffset(this.oxygenAtom).set( INITIAL_CARBON_OXYGEN_DISTANCE / 2, 0);

            this.updateAtomPositions();
        },

        /**
         * Set the angle, in terms of radians from 0 to 2*PI, where this
         *   molecule is in its vibration sequence.
         */
        vibrate: function(vibrationRadians) {
            Molecule.prototype.vibrate.apply(this, arguments);

            var multFactor = Math.sin(vibrationRadians);
            this.getVibrationAtomOffset(this.carbonAtom).set( VIBRATION_MAGNITUDE * multFactor, 0);
            this.getVibrationAtomOffset(this.oxygenAtom).set(-VIBRATION_MAGNITUDE * multFactor, 0);

            this.updateAtomPositions();
        }

    });

    return CO;
});
