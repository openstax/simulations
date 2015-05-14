define(function (require) {

    'use strict';

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');

    var Constants = require('constants');

    /**
     * Represents a molecule that is made up of any number of
     *   atoms and bonds.  Note that its "position" property
     *   is the location of the molecule's center of gravity.
     */
    var Molecule = MotionObject.extend({

        initialize: function(attributes, options) {
            // Atoms and bonds that comprise this molecule.
            this.atoms = [];
            this.atomicBonds = [];

            // Structure of the molecule in terms of offsets from the center of
            //   gravity.  These indicate the atom's position in the "relaxed"
            //   (i.e. non-vibrating), non-rotated state.
            this.initialAtomCogOffsets = [];

            // Vibration offsets - these represent the amount of deviation from
            //   the initial (a.k.a relaxed) configuration for each molecule.
            this.vibrationAtomOffsets = [];

            // Currently active photon absorption strategy, active because a
            //   photon was absorbed that activated it.
            this.activePhotonAbsorptionStrategy = null;

            // Prevents reabsorption for a while after emitting a photon.
            this.absorbtionHysteresisCountdownTime = 0;

            // The "pass through photon list" keeps track of photons that were not
            //   absorbed due to random probability (essentially a simulation of
            //   quantum properties).  This is needed since the absorption of a
            //   given photon will likely be tested at many time steps as the
            //   photon moves past the molecule, and we don't want to keep deciding
            //   about the same photon.
            this.passThroughPhotonList = [];

            // The current point within this molecule's vibration sequence.
            this.currentVibrationRadians = 0;

            // The amount of rotation currently applied to this molecule.  This
            //   is relative to its original, non-rotated state.
            this.currentRotationRadians = 0;

            // Tracks if molecule is higher energy than its ground state.
            this.highElectronicEnergyState = false;

            // Boolean values that track whether the molecule is vibrating or
            //   rotating.
            this.vibrating = false;
            this.rotating = false;
            this.rotationDirectionClockwise = true; // Controls the direction of rotation.

            // List of constituent molecules. This comes into play only when the
            //   molecule breaks apart, which many of the molecules never do.
            this.constituentMolecules = [];
        },
        

    }, Constants.Molecule);

    return Molecule;
});
