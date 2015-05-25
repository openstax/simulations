define(function (require) {

    'use strict';

    var PhotonAbsorptionStrategy = require('models/photon-absorption-strategy');
    var Molecule                 = require('models/molecule');
    var HydrogenAtom             = require('models/atom/hydrogen');
    var OxygenAtom               = require('models/atom/oxygen');
    var AtomicBond               = require('models/atomic-bond');

    var Constants = require('constants');

    // These constants define the initial shape of the water atom.  The angle
    //   between the atoms is intended to be correct, and the bond is somewhat
    //   longer than real life.  The algebraic calculations are intended to
    //   make it so that the bond length and/or the angle could be changed and
    //   the correct center of gravity will be maintained.
    var OXYGEN_HYDROGEN_BOND_LENGTH = 130;
    var INITIAL_HYDROGEN_OXYGEN_HYDROGEN_ANGLE = 109 * Math.PI / 180;
    var INITIAL_MOLECULE_HEIGHT = OXYGEN_HYDROGEN_BOND_LENGTH * Math.cos(INITIAL_HYDROGEN_OXYGEN_HYDROGEN_ANGLE / 2);
    var TOTAL_MOLECULE_MASS = OxygenAtom.MASS + (2 * HydrogenAtom.MASS);
    var INITIAL_OXYGEN_VERTICAL_OFFSET = INITIAL_MOLECULE_HEIGHT * ((2 * HydrogenAtom.MASS) / TOTAL_MOLECULE_MASS);
    var INITIAL_HYDROGEN_VERTICAL_OFFSET = -(INITIAL_MOLECULE_HEIGHT - INITIAL_OXYGEN_VERTICAL_OFFSET);
    var INITIAL_HYDROGEN_HORIZONTAL_OFFSET = OXYGEN_HYDROGEN_BOND_LENGTH * Math.sin(INITIAL_HYDROGEN_OXYGEN_HYDROGEN_ANGLE / 2);

    /**
     * Class that represents water (H2O) in the model.
     */
    var H2O = Molecule.extend({

        initialize: function(attributes, options) {
            Molecule.prototype.initialize.apply(this, arguments);

            // Create and add atoms
            this.oxygenAtom  = this.addAtom(new OxygenAtom());
            this.hydrogenAtom1 = this.addAtom(new HydrogenAtom());
            this.hydrogenAtom2 = this.addAtom(new HydrogenAtom());

            // Create and add bonds
            this.addAtomicBond(new AtomicBond(this.atoms[this.oxygenAtom], this.atoms[this.hydrogenAtom1], 1));
            this.addAtomicBond(new AtomicBond(this.atoms[this.oxygenAtom], this.atoms[this.hydrogenAtom2], 1));

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
            this.getInitialAtomCogOffset(this.oxygenAtom).set(0, INITIAL_OXYGEN_VERTICAL_OFFSET);
            this.getInitialAtomCogOffset(this.hydrogenAtom1).set( INITIAL_HYDROGEN_HORIZONTAL_OFFSET, INITIAL_HYDROGEN_VERTICAL_OFFSET);
            this.getInitialAtomCogOffset(this.hydrogenAtom2).set(-INITIAL_HYDROGEN_HORIZONTAL_OFFSET, INITIAL_HYDROGEN_VERTICAL_OFFSET);

            this.updateAtomPositions();
        },

        /**
         * Set the angle, in terms of radians from 0 to 2*PI, where this
         *   molecule is in its vibration sequence.
         */
        vibrate: function(vibrationRadians) {
            Molecule.prototype.vibrate.apply(this, arguments);

            var multFactor = Math.sin(vibrationRadians);
            var maxOxygenDisplacement = 3;
            var maxHydrogenDisplacement = 18;

            this.getInitialAtomCogOffset(this.oxygenAtom).set(
                0, 
                INITIAL_OXYGEN_VERTICAL_OFFSET - multFactor * maxOxygenDisplacement
            );
            this.getInitialAtomCogOffset(this.hydrogenAtom1).set(
                INITIAL_HYDROGEN_HORIZONTAL_OFFSET + multFactor * maxHydrogenDisplacement,
                INITIAL_HYDROGEN_VERTICAL_OFFSET   + multFactor * maxHydrogenDisplacement
            );
            this.getInitialAtomCogOffset(this.hydrogenAtom2).set(
                -INITIAL_HYDROGEN_HORIZONTAL_OFFSET - multFactor * maxHydrogenDisplacement,
                 INITIAL_HYDROGEN_VERTICAL_OFFSET   + multFactor * maxHydrogenDisplacement
            );

            this.updateAtomPositions();
        }

    });

    return H2O;
});
