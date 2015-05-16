define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');
    var Vector2      = require('common/math/vector2');

    var PhotonAbsorptionStrategy = require('models/photon-absorption-strategy');
    var Photon                   = require('models/photon');

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
            rotation: 0,                      // Rotation in radians
            highElectronicEnergyState: false  // Tracks if molecule is higher energy than its ground state.
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, arguments);

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

            // Map that matches photon wavelengths to photon absorption strategies.
            //   The strategies contained in this structure define whether the
            //   molecule can absorb a given photon and, if it does absorb it, how
            //   it will react.
            this.wavelengthToAbsorptionStrategy = {};

            // Currently active photon absorption strategy, active because a
            //   photon was absorbed that activated it.
            this.activePhotonAbsorptionStrategy = null;

            // Prevents reabsorption for a while after emitting a photon.
            this.absorptionHysteresisCountdownTime = 0;

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

            // List of constituent molecules. This comes into play only when the
            //   molecule breaks apart, which many of the molecules never do.
            this.constituentMolecules = [];

            // Cached objects for internal use
            this._offset = new Vector2();
            this._rect = new Rectangle();
            this._nullPhotonAbsorptionStrategy = new PhotonAbsorptionStrategy.NullPhotonAbsorptionStrategy(this);

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
         * Returns an array of the molecule's atoms
         */
        getAtoms: function() {
            return this.atoms;
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
            this.initialAtomCogOffsets[atomIndex].set(offset);
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
         * Set the current vibration offset from the molecule's center of
         *   gravity (COG) for the specified molecule. Parameter can either
         *   be the index of the atom in the atom array or the atom object.
         */
        setVibrationAtomOffset: function(atomIndex, offset) {
            if (!_.isNumber(atomIndex))
                atomIndex = this.getAtomIndex(atomIndex);
            this.vibrationAtomOffsets[atomIndex].set(offset);
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
         * Returns an array of the molecule's atomic bonds.
         */
        getAtomicBonds: function() {
            return this.atomicBonds;
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

            if (this.absorptionHysteresisCountdownTime >= 0)
                this.absorptionHysteresisCountdownTime -= deltaTime;

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
        },

        /**
         * Returns whether or not the molecule should absorb the offered
         *   photon.  If the photon is absorbed, the matching absorption 
         *   strategy is set so that it can control the molecule's post-
         *   absorption behavior.
         */
        shouldAbsorbPhoton: function(photon) {
            var absorbPhoton = false;

            if (!this.isPhotonAbsorbed() && 
                !this.isPhotonMarkedForPassThrough(photon) &&
                this.absorptionHysteresisCountdownTime <= 0 &&
                photon.get('position').distance(this.get('position')) < Molecule.PHOTON_ABSORPTION_DISTANCE) {

                // The circumstances for absorption are correct, but do we have
                //   an absorption strategy for this photon's wavelength?
                var candidateAbsorptionStrategy = this.wavelengthToAbsorptionStrategy(photon.get('wavelength'));
                if (candidateAbsorptionStrategy !== null) {
                    // Yes, there is a strategy available for this wavelength.
                    //   Ask it if it wants the photon.
                    if (candidateAbsorptionStrategy.shouldAbsorbPhoton(photon)) {
                        // We do want it, so consider the photon absorbed.
                        this.absorbPhoton = true;
                        this.activePhotonAbsorptionStrategy = candidateAbsorptionStrategy;
                        this.activePhotonAbsorptionStrategy.absorbPhoton(photon);
                    }
                    else {
                        // We don't want to waste time asking again
                        this.markPhotonForPassThrough(photon);
                    }
                }
            }

            return absorbPhoton;
        },

        /**
         * Returns whether a photon has been absorbed.
         */
        isPhotonAbsorbed: function() {
            // If there is an active non-null photon absorption strategy, 
            //   it indicates that a photon has been absorbed.
            return !(this.activePhotonAbsorptionStrategy instanceof PhotonAbsorptionStrategy.NullPhotonAbsorptionStrategy);
        },

        /**
         * Resets the photon absorption strategy to the null one
         */
        resetPhotonAbsorptionStrategy: function() {
            this.activePhotonAbsorptionStrategy = this._nullPhotonAbsorptionStrategy;
        },

        /**
         * 
         */
        addPhotonAbsorptionStrategy: function(wavelength, strategy) {
            this.wavelengthToAbsorptionStrategy[wavelength] = strategy;
        },

        /**
         * Emits in a random direction either the given photon or
         *   a new photon of the specified wavelength.  Parameter
         *   is either a photon or a wavelength.
         */
        emitPhoton: function(photonToEmit) {
            // Optionally the wavelength could be passed in
            if (_.isNumber(photonToEmit)) {
                photonToEmit = new Photon({
                    wavelength: photonToEmit
                });
            }

            var emissionAngle = Math.random() * Math.PI * 2;
            photonToEmit.setVelocity(
                Molecule.PHOTON_EMISSION_SPEED * Math.cos(emissionAngle),
                Molecule.PHOTON_EMISSION_SPEED * Math.sin(emissionAngle)
            );
            photonToEmit.setPosition(this.get('position'));

            this.trigger('photon-emitted', photonToEmit);
            this.absorptionHysteresisCountdownTime = Molecule.ABSORPTION_HYSTERESIS_TIME;
        },

        /**
         * Returns an enclosing rectangle for this molecule. This
         *   was created to support searching for open locations
         *   for new molecules.
         */
        getBoundingRect: function() {
            var minX = Number.POSITIVE_INFINITY;
            var minY = Number.POSITIVE_INFINITY;
            var maxX = Number.NEGATIVE_INFINITY;
            var maxY = Number.NEGATIVE_INFINITY;

            for (var i = 0; i < this.atoms.length; i++) {
                minX = Math.min(minX, this.atoms[i].getBoundingRect().left());
                minY = Math.min(minY, this.atoms[i].getBoundingRect().bottom());
                maxX = Math.max(maxX, this.atoms[i].getBoundingRect().right());
                maxY = Math.max(maxY, this.atoms[i].getBoundingRect().top());
            }

            return this._rect.set(
                minX,
                minY,
                maxX - minX,
                maxY - minY
            );
        }

    }, Constants.Molecule);

    return Molecule;
});
