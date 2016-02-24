define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Vector2 = require('../math/vector2');

    var QuantumConfig = require('../config');

    var Photon      = require('./photon');
    var PhysicsUtil = require('./physics-util');


    var constants = {};
    constants.minWavelength = Photon.BLUE - 20;
    constants.maxWavelength = Photon.GRAY;
    constants.minEnergy = PhysicsUtil.wavelengthToEnergy(constants.maxWavelength);
    constants.maxEnergy = PhysicsUtil.wavelengthToEnergy(constants.minWavelength);
    constants.STIMULATION_LIKELIHOOD = QuantumConfig.STIMULATION_LIKELIHOOD;
    constants.wavelengthTolerance = 10;


    /**
     * Represents an object in 2D space and provides some helper functions
     *   for changing a position vector in a way that leverages Backbone's
     *   event system.
     */
    var AtomicState = Backbone.Model.extend({

        defaults: {
            energyLevel: undefined,
            // The lifetime of the state--this is based on the energy level;
            //   the higher the energy, the shorter the lifetime.
            meanLifetime: Number.POSITIVE_INFINITY,
            nextHigherState: undefined,
            nextLowerState: undefined
        },
        
        initialize: function(attributes, options) {
            // Cached objects
            this._vHat = new Vector2();
            this._photonPosition = new Vector2();
        },

        clone: function() {
            var atomicState = new AtomicState();

            atomicState.set('energyLevel',     this.get('energyLevel'));
            atomicState.set('meanLifetime',    this.get('meanLifetime'));
            atomicState.set('nextHigherState', this.get('nextHigherState'));
            atomicState.set('nextLowerState',  this.get('nextLowerState'));
            
            return atomicState;
        },

        enterState: function(atom) {},

        leaveState: function(atom) {},

        /**
         * Returns the wavelength of a photon that would be emitted if the atom dropped to
         *   the next lower energy state
         *
         * @return wavelength of emitted photon
         */
        determineEmittedPhotonWavelength: function(nextState) {
            if (nextState === undefined)
                nextState = this.get('nextLowerState');

            var energy1 = PhysicsUtil.wavelengthToEnergy(this.getWavelength());
            var energy2 = PhysicsUtil.wavelengthToEnergy(nextState.getWavelength());
            var emittedWavelength = Math.min(
                PhysicsUtil.energyToWavelength(energy1 - energy2),
                AtomicState.maxWavelength
            );

            return emittedWavelength;
        },

        /**
         * Tells if a photon will be emitted from this state if the atom is struck by a
         *   specified photon. This is true if the energy of the specified photon is equal,
         *   within a tolerance, of the difference in energy between this state and the
         *   next lowest energy state.
         *
         * @param photon
         * @return true if the photon makes the atom go to a higher state
         */
        isStimulatedBy: function(photon, atom) {
            var result = false;
            var states = atom.getStates();
            var stimulatedPhotonEnergy;

            if (QuantumConfig.ENABLE_ALL_STIMULATED_EMISSIONS) {
                for (var i = 0; i < states.length && states[i] !== this && result === false; i++) {
                    var state = states[i];
                    if (state.get('energyLevel') < this.get('energyLevel') ) {
                        stimulatedPhotonEnergy = this.get('energyLevel') - state.get('energyLevel');
                        result = (
                            Math.abs(photon.getEnergy() - stimulatedPhotonEnergy) <= QuantumConfig.ENERGY_TOLERANCE && 
                            Math.random() < AtomicState.STIMULATION_LIKELIHOOD
                        );
                    }
                }
            }
            else {
                stimulatedPhotonEnergy = this.getEnergyLevel() - this.getNextLowerEnergyState().getEnergyLevel();
                result = (
                    Math.abs(photon.getEnergy() - stimulatedPhotonEnergy) <= QuantumConfig.ENERGY_TOLERANCE && 
                    Math.random() < AtomicState.STIMULATION_LIKELIHOOD
                );
            }

            return result;
        },

        /**
         * Handles the collision of an atom with a photon
         */
        collideWithPhoton: function(atom, photon) {

            // See if the photon knocks the atom to a higher state
            var newState = this.getElevatedState(atom, photon, this.get('energyLevel'));
            if (newState) {
                photon.destroy();
                atom.setCurrState(newState);
                return;
            }

            // If the photon has the same energy as the difference
            //   between this level and a lower state, then emit a
            //   photon of that energy
            if (this.isStimulatedBy(photon, atom)) {
                // Place the replacement photon beyond the atom, so it doesn't
                //   collide again right away
                var vHat = this._vHat.set(photon.get('velocity')).normalize();
                vHat.scale(atom.get('radius'));
                var position = this._photonPosition.set(
                    atom.getX() + vHat.getX(),
                    atom.getY() + vHat.getY()
                );
                photon.setPosition(position);

                var emittedPhoton = StimulatedPhoton.createStimulated(photon, position, atom);
                atom.emitPhoton(emittedPhoton);

                // Change state
                atom.setCurrState(atom.getLowestEnergyState());
            }
        },

        /**
         * Tests only the energy level and wavelength. Cannot test the nextHigherState and nextLowerState
         * because that results in stack overflows.
         *
         * @param obj
         * @return true if equal
         */
        equals: function(obj) {
            if (obj instanceof AtomicState && obj)
                return this.get('energyLevel') === obj.get('energyLevel');
            
            return false;
        },

        /**
         * Searches through the states of a specified atom for one whose energy differential
         *   between it and a specified energy matches the energy in a specified photon. The
         *   reason the energy needs to be specified as a parameter is that the GroundState
         *   has to pretend it has energy of 0 for the colors and such to work right, but
         *   other states can use their actual energies.
         *
         * @param atom
         * @param photon
         * @param energy
         * @return the state that the atom can be in that is the specified energy above its current state
         */
        getElevatedState: function(atom, photon, energy) {
            var result = null;
            var states = atom.getStates();
            for (var stateIdx = states.length - 1; stateIdx >= 0 && states[stateIdx] != this && result == null; stateIdx--) {
                var de = photon.getEnergy() - (states[stateIdx].get('energyLevel') - energy);
                if (Math.abs(de) <= QuantumConfig.ENERGY_TOLERANCE)
                    result = states[stateIdx];
            }
            return result;
        },

        /**
         * Converts the energy level into a wavelength and returns it.
         */
        getWavelength: function() {
            return PhysicsUtil.energyToWavelength(this.get('energyLevel'));
        },

        getNextLowerEnergyState: function() {
            return this.get('nextLowerState');
        },

        getNextHigherEnergyState: function() {
            return this.get('nextHigherState');
        }

    }, _.extend({}, constants, {
        
        /**
         * Sets the next-higher and next-lower attributes for an array of AtomicStates
         *
         * @param states
         */
        linkStates: function(states) {
            for (var i = 1; i < states.length; i++) {
                states[i ].set('nextLowerState', states[i - 1]);
                states[i - 1].set('nextHigherState', states[i]);
            }

            states[states.length - 1].set('nextHigherState', AtomicState.MaxEnergyState.instance());
        }

    });


    /**
     * Energy state with maximum energy
     */
    var MaxEnergyState = AtomicState.extend({

        collideWithPhoton: function(atom, photon) {},

        getWavelength: function() {
            // The hard-coded number here is a hack so the energy level graphic can be
            //   adjusted up to the top of the window. This is not great programming
            return MaxEnergyState.minWavelength - 80;
        }

    }, {

        instance: function() {
            if (!this._instance)
                this._instance = new MaxEnergyState();
            return this._instance;
        }

    });


    /**
     * Energy state with minimum energy
     */
    var MinEnergyState = AtomicState.extend({

        initialize: function(attributes, options) {
            AtomicState.prototype.initialize.apply(this, arguments);

            this.set('energyLevel', MinEnergyState.minEnergy);
        },

        collideWithPhoton: function(atom, photon) {}

    }, {

        instance: function() {
            if (!this._instance)
                this._instance = new MinEnergyState();
            return this._instance;
        }

    });


    AtomicState.MaxEnergyState = MaxEnergyState;
    AtomicState.MinEnergyState = MinEnergyState;


    return AtomicState;
});
