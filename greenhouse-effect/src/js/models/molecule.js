define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');
    var Vector2      = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * Represents a molecule that is made up of any number of
     *   atoms and bonds.  Note that its "position" property
     *   is the location of the molecule's center of gravity.
     */
    var Molecule = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            vibrating: false, // Whether or not the molecule is vibrating
            rotating: false,  // Whether or not the molecule is rotating
            rotationDirectionClockwise: true, // The direction of rotation
            rotation: 0                       // Rotation in radians
        }),

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

            // List of constituent molecules. This comes into play only when the
            //   molecule breaks apart, which many of the molecules never do.
            this.constituentMolecules = [];

            // Cached objects for internal use
            this._offset = new Vector2();

            // Whenever the position (center of gravity) is updated, we must also
            //   update the 
            this.on('change:position change:rotation', this.updateAtomPositions);
        },

        /**
         * Initialize sthe offsets from the center of gravity for each atom
         *   within this molecule.  This should be in the "relaxed" (i.e.
         *   non-vibrating) state.
         */
        initAtomOffsets: function() {},

        /**
         * Adds an atom and returns its index.
         */
        addAtom: function(atom) {
            this.atoms.push(atom);
            this.initialAtomCogOffsets.push(new Vector2());
            this.vibrationAtomOffsets.push(new Vector2());

            return this.atoms.length - 1;
        },

        /**
         * Attempts to retrieve an atom's index and throws an exception if the
         *   atom was not found in the atom array.
         */
        getAtomIndex: function(atom) {
            var atomIndex = _.indexOf(this.atoms, atom);
            if (atomIndex === -1)
                throw 'Specified atom was not found in this molecule.';
            return atomIndex;
        },

        /**
         * Sets an initial offset from the molecule's Center of Gravity (COG).
         *   The offset is "initial" because this is where the atom should be
         *   when it is not vibrating or rotating.  First parameter can be
         *   either the index of the atom in the atom array or the atom object.
         */
        setInitialAtomCogOffset: function(atomIndex, offset) {
            if (!_.isNumber(atomIndex))
                atomIndex = this.getAtomIndex(atomIndex);
            this.initialAtomCogOffsets[atomIndex] = offset;
        },

        /**
         * Get the initial offset from the molecule's center of gravity (COG)
         *   for the specified molecule. Parameter can be either the index of
         *   the atom in the atom array or the atom object.
         */
        getInitialAtomCogOffset: function(atomIndex) {
            if (!_.isNumber(atomIndex))
                atomIndex = this.getAtomIndex(atomIndex);
            return this.initialAtomCogOffsets[atomIndex];
        },

        /**
         * Get the current vibration offset from the molecule's center of
         *   gravity (COG) for the specified molecule. Parameter can either
         *   be the index of the atom in the atom array or the atom object.
         */
        getVibrationAtomOffset: function(atomIndex) {
            if (!_.isNumber(atomIndex))
                atomIndex = this.getAtomIndex(atomIndex);
            return this.vibrationAtomOffsets[atomIndex];
        },

        /**
         * Adds an atomic bond
         */
        addAtomicBond: function(atomicBond) {
            this.atomicBond.push(atomicBond);
        },

        /**
         * Adds a "constituent molecule" to this molecule's list.  Constituent
         *   molecules are what this molecule will break into if it breaks apart.
         *   Note that this does NOT check for any sort of conservation of atoms,
         *   so use this carefully or weird break apart behaviors could result.
         */
        addConstituentMolecule: function(molecule) {
            this.constituentMolecules.push(molecule);
        },

        /**
         * Advance the molecule one step in time.
         */
        update: function(deltaTime) {
            this.activePhotonAbsorptionStrategy.update(deltaTime);

            if (this.absorbtionHysteresisCountdownTime >= 0)
                this.absorbtionHysteresisCountdownTime -= deltaTime;

            if (this.get('vibrating'))
                this.advanceVibration(deltaTime * Molecule.VIBRATION_FREQUENCY * 2 * Math.PI);

            if (this.get('rotating')) {
                var directionMultiplier = this.get('rotationDirectionClockwise') ? -1 : 1;
                this.rotate(deltaTime * Molecule.ROTATION_RATE * 2 * Math.PI * directionMultiplier);
            }

            // I'm really not sure why, but the original PhET version had us
            //   performing both of the following operations.  What confuses
            //   me is that we're always adding the whole velocity regardless
            //   of how much time has passed, so I don't know why we even
            //   care about the second line unless the delta times were huge.
            // I think the answer may be in the fact that the original delta
            //   time was in milliseconds, which *would* be a very large 
            //   delta time.  In my version, we pass deltaTime as seconds,
            //   which is very small, so I'm going to remove that addition
            //   of velocity until further notice.
            //this.translate(this.get('velocity'));
            this.updatePositionFromVelocity(deltaTime);
        },

        /**
         * Advance the vibration by the prescribed radians.
         */
        advanceVibration: function(deltaRadians) {
            this.vibrate(this.currentVibrationRadians + deltaRadians);
        },

        /**
         * Set the angle, in terms of radians from 0 to 2*PI, where this
         *   molecule is in its vibration sequence.  This implements no
         *   actual vibration by default but can be overridden in child
         *   classes as needed.
         */
        vibrate: function(vibrationRadians) {
            this.currentVibrationRadians = vibrationRadians;
        },

        /**
         * Rotate the molecule about the center of gravity by the specified
         *   number of radians.
         */
        rotate: function(deltaRadians) {
            this.set('rotation', (this.get('rotation') + deltaRadians) % (Math.PI * 2));
        },

        /**
         * Updates all of the atoms' absolute positions based off of their
         *   relative offsets to the center of mass and the current rotation.
         */
        updateAtomPositions: function() {
            var offset = this._offset;
            for (var i = 0; i < this.atoms.length; i++) {
                offset.set(this.initialAtomCogOffsets[i]);
                // Add the vibration if any exists
                offset.add(this.vibrationAtomOffsets[i]);
                // Rotate
                offset.rotate(this.get('rotation'));
                // Set the atom's new position based on the combination of
                //   offset and the current center of gravity (position).
                this.atoms[i].setPosition(offset.add(this.get('position')));
            }
        },

        /**
         * Cause the molecule to dissociate, i.e. to break apart.
         */
        breakApart: function() {},

        /**
         * Adds a photon to the pass-though list
         */
        markPhotonForPassThrough: function(photon) {
            // Make room for this photon be deleting the oldest one.
            if (this.passThroughPhotonList.length >= Molecule.PASS_THROUGH_PHOTON_LIST_SIZE)
                this.passThroughPhotonList.shift();

            this.passThroughPhotonList.push(photon);
        },

        /**
         * Returns whether or not a given photon is in this molecule's
         *   photon list.
         */
        isPhotonMarkedForPassThrough: function(photon) {
            return (_.indexOf(this.passThroughPhotonList, photon) !== -1);
        }

    }, Constants.Molecule);

    return Molecule;
});
