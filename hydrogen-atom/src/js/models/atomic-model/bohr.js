define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2     = require('common/math/vector2');
    var RandomUtils = require('common/math/random-utils');

    var AbstractAtomicModel  = require('hydrogen-atom/models/atomic-model');
    var RutherfordScattering = require('hydrogen-atom/models/rutherford-scattering');
    var Photon               = require('hydrogen-atom/models/photon');
    
    var Constants = require('constants');

    var DEG_TO_RAD = Math.PI / 180;

    /**
     * BohrModel is the Bohr model of the hydrogen atom.
     * 
     * Physical representation:
     * Electron orbiting a proton.
     * Each orbit corresponds to a different electron state.
     * See createOrbitRadii for details on how orbit radii are calculated.
     * 
     * Collision behavior:
     * Alpha particles are repelled by the electron using a Rutherford Scattering algorithm.
     * Photons may be absorbed (see below) if they collide with the electron.
     * 
     * Absorption behavior:
     * Photons that match the transition wavelength of the electron's state are 
     * absorbed with some probability. Other photons are not absorbed or affected.
     * 
     * Emission behavior:
     * Spontaneous emission of a photon takes the electron to a lower state,
     * and the photon emitted is has the transition wavelength that corresponds
     * to the current and new state. Transition to each lower state is equally 
     * likely. 
     * Stimulated emission of a photon occurs when a photon that hits the 
     * electron, and the photon's wavelength corresponds to a wavelength 
     * the could have been absorbed in a lower state.  In this case, the 
     * colliding photon is not aborbed, but a new photon is emitted with 
     * the same wavelength, and the electron moves to the lower state.
     */
    var BohrModel = AbstractAtomicModel.extend({

        defaults: _.extend({}, AbstractAtomicModel.prototype.defaults, {
            orientation: 0,
            electronState: AbstractAtomicModel.GROUND_STATE
        }),

        initialize: function(attributes, options) {
            AbstractAtomicModel.prototype.initialize.apply(this, [attributes, options]);

            // time that the electron has been in its current state
            this.timeInState = 0;
            // current angle of electron
            this.electronAngle = RandomUtils.randomAngle();
            // offset of the electron relative to atom's center
            this.electronOffset = new Vector2();
            // electron's position in 2D space
            this.electronPosition = new Vector2();

            // Cached objects
            this._position = new Vector2();

            this.on('change:electronState', this.electronStateChanged);
        },

        /**
         * Moves a photon.
         *
         * A collision occurs when a photon comes "close" to the electron.
         *   If a collision occurs, there is a probability of absorption.
         *   If there is no absorption, then there may be stimulated emission.
         * 
         * Nothing is allowed to happen until the electron has been in its 
         *   current state for a minimum time period.
         */
        movePhoton: function(photon, deltaTime) {
            var absorbed = this.attemptAbsorption(photon);
            if (!absorbed) {
                this.attemptStimulatedEmission(photon);
                AbstractAtomicModel.prototype.movePhoton.apply(this, arguments);
            }
        },
        
        /**
         * Moves an alpha particle using a Rutherford Scattering algorithm.
         */
        moveAlphaParticle: function(alphaParticle, deltaTime) {
            RutherfordScattering.moveParticle(this, alphaParticle, deltaTime);
        },
        
        /**
         * Gets the transition wavelengths for a specified state.
         */
        getTransitionWavelengths: function(state) {
            var transitionWavelengths = null;
            var maxState = this.getGroundState() + BohrModel.getNumberOfStates() - 1;
            var numWavelengths = maxState - state;
            if (state < maxState) {
                transitionWavelengths = [];
                for (var i = 0; i < numWavelengths; i++)
                    transitionWavelengths[i] = this.getWavelengthAbsorbed(state, state + i + 1);
            }
            return transitionWavelengths;
        },
        
        //----------------------------------------------------------------------------
        // ModelElement implementation
        //----------------------------------------------------------------------------
        
        /**
         * Advances the model when the clock ticks.
         * @param deltaTime
         */
        update: function(time, deltaTime) {
            // Keep track of how long the electron has been in its current state.
            this.timeInState += deltaTime;
            
            // Advance the electron along its orbit
            this.electronAngle = this.calculateNewElectronAngle(deltaTime);
            this.updateElectronOffset();

            // Attempt to emit a photon
            this.attemptSpontaneousEmission();
        },
        
        //----------------------------------------------------------------------------
        // Electron methods
        //----------------------------------------------------------------------------
        
        /**
         * Gets the electron's state.
         */
        getElectronState: function() {
            return this.get('electronState');
        },
        
        /*
         * Sets the electron's state.
         */
        setElectronState: function(state) {
            this.set('electronState', state);
        },

        electronStateChanged: function(simulation, state) {
            if (!(state >= BohrModel.GROUND_STATE && state <= BohrModel.GROUND_STATE + BohrModel.getNumberOfStates() - 1))
                throw 'Bad state';

            this.timeInState = 0;
        },
        
        /**
         * Gets the electron's offset, relative to the atom's center.
         * This method does NOT allocate a Vector2 -- do not modify the value returned!
         */
        getElectronOffsetRef: function() {
            return this.electronOffset;
        },
        
        /*
         * Gets the electron's position in world coordinates.
         * This is the electron's offset adjusted by the atom's position.
         * This method does NOT allocate a Vector2 -- do not modify the value returned!
         */
        getElectronPosition: function() {
            return this.electronPosition;
        },
        
        /*
         * Updates the electron's offset (and position) to match its current orbit and angle.
         * This is essentially a conversion from Cartesian to Polar coordinates.
         */
        updateElectronOffset: function() {
            var radius = BohrModel.getOrbitRadius(this.get('electronState'));
            var xOffset = radius * Math.sin(this.electronAngle);
            var yOffset = radius * Math.cos(this.electronAngle);
            this.electronOffset.set(xOffset, yOffset);
            this.electronPosition.set(this.getX() + xOffset, this.getY() + yOffset); // adjust for atom position
        },
        
        /**
         * Gets the current angle of the electron.
         * The orbit radius and this angle determine the electron's offset
         * in Polar coordinates.
         */
        getElectronAngle: function() {
            return this.electronAngle;
        },
        
        /*
         * Gets the change in electron angle per unit of time.
         */
        getElectronAngleDelta: function() {
           return BohrModel.ELECTRON_ANGLE_DELTA;
        },
        
        /**
         * Calculates the new electron angle for some time step.
         * Subclasses may override this to produce different oscillation behavior.
         */
        calculateNewElectronAngle: function(deltaTime) {
            var deltaAngle = deltaTime * (BohrModel.ELECTRON_ANGLE_DELTA / (this.get('electronState') * this.get('electronState')));
            return this.electronAngle - deltaAngle; // clockwise
        },
        
        //----------------------------------------------------------------------------
        // Orbit methods
        //----------------------------------------------------------------------------
        
        /**
         * Gets the radius of the electron's orbit.
         * The orbit radius and the electron's angle determine 
         * the electron's offset in Polar coordinates.
         */
        getElectronOrbitRadius: function() {
            return BohrModel.getOrbitRadius(this.get('electronState'));
        },
        
        /*
         * Determines if two wavelengths are "close enough" 
         *   for the purposes of absorption and emission.
         */
        closeEnough: function(w1, w2) {
            return (Math.abs(w1 - w2) < BohrModel.WAVELENGTH_CLOSENESS_THRESHOLD);
        },
        
        /**
         * Determines whether a photon collides with this atom.
         * In this case, we treat the photon and electron as points, 
         *   and see if the points are close enough to cause a collision.
         */
        collides: function(photon) {
            return BohrModel.pointsCollide(this.electronPosition, photon.getPosition(), BohrModel.COLLISION_CLOSENESS);
        },
        
        /**
         * Attempts to absorb a specified photon.
         */
        attemptAbsorption: function(photon) {
            var success = false;
            
            if (!BohrModel.DEBUG_ABSORPTION_ENABLED)
                return false;
            
            // Has the electron been in this state awhile?
            // Was this photon fired by the gun?
            if (this.timeInState >= BohrModel.MIN_TIME_IN_STATE && !photon.isEmitted()) {
                // Do the photon and electron collide?
                var collide = this.collides(photon);
                if (collide) {
                    // Is the photon absorbable, does it have a transition wavelength?
                    var canAbsorb = false;
                    var newState = 0;
                    var maxState = BohrModel.GROUND_STATE + BohrModel.getNumberOfStates() - 1;
                    var photonWavelength = photon.get('wavelength');
                    for (var n = this.get('electronState') + 1; n <= maxState && !canAbsorb; n++ ) {
                        var transitionWavelength = BohrModel.getWavelengthAbsorbed(this.get('electronState'), n);
                        if (this.closeEnough(photonWavelength, transitionWavelength)) {
                            canAbsorb = true;
                            newState = n;
                        }
                    }

                    // Is the transition that would occur allowed?
                    if (!this.absorptionIsAllowed(this.get('electronState'), newState))
                        return false;
                    
                    // Absorb the photon with some probability...
                    if (canAbsorb && this.absorptionIsCertain()) {
                        // Absorb photon
                        success = true;
                        this.firePhotonAbsorbed(photon);

                        if (BohrModel.DEBUG_OUTPUT_ENABLED)
                            console.log('BohrModel: absorbed photon, wavelength=' + photonWavelength);

                        // Move electron to new state
                        this.setElectronState(newState);
                    }
                }
            }
            
            return success;
        },
        
        /**
         * Probabilistically determines whether to absorb a photon.
         */
        absorptionIsCertain: function() {
            return Math.random() < BohrModel.PHOTON_ABSORPTION_PROBABILITY;
        },
        
        /**
         * Determines if a proposed state transition caused by absorption is legal.
         * Always true for Bohr.
         */
        absorptionIsAllowed: function(nOld, nNew) {
            return true;
        },
        
        /**
         * Attempts to stimulate emission with a specified photon.
         * 
         * Definition of stimulated emission, for state m < n:
         *   If an electron in state n gets hit by a photon whose absorption
         *   would cause a transition from state m to n, then the electron
         *   should drop to state m and emit a photon.  The emitted photon
         *   should be the same wavelength and be traveling alongside the 
         *   original photon.
         */
        attemptStimulatedEmission: function(photon) {
            var success = false;
            
            if (!BohrModel.DEBUG_STIMULATED_EMISSION_ENABLED)
                return false;
            
            // Are we in some state other than the ground state?
            // Has the electron been in this state awhile?
            // Was this photon fired by the gun?
            if (this.get('electronState') > BohrModel.GROUND_STATE &&
                this.timeInState >= BohrModel.MIN_TIME_IN_STATE && 
                !photon.isEmitted()
            ) {
                
                // Do the photon and electron collide?
                var collide = this.collides(photon);
                if (collide) {
                    // Can this photon stimulate emission, does it have a transition wavelength?
                    var canStimulateEmission = false;
                    var photonWavelength = photon.getWavelength();
                    var newState = 0;
                    for (var state = BohrModel.GROUND_STATE; state < this.get('electronState') && !canStimulateEmission; state++) {
                        var transitionWavelength = BohrModel.getWavelengthAbsorbed(state, this.get('electronState'));
                        if (this.closeEnough(photonWavelength, transitionWavelength)) {
                            canStimulateEmission = true;
                            newState = state;
                        }
                    }
                    
                    // Is the transition that would occur allowed?
                    if (!this.stimulatedEmissionIsAllowed(this.get('electronState'), newState))
                        return false;
                    
                    // Emit a photon with some probability...
                    if (canStimulateEmission && this.stimulatedEmissionIsCertain()) {
                        
                        // This algorithm assumes that photons are moving vertically from bottom to top.
                        if (!(photon.get('orientation') == -90 * DEG_TO_RAD));
                        
                        // New photon's properties
                        var wavelength = photon.getWavelength();
                        var x = photon.getX() + BohrModel.STIMULATED_EMISSION_X_OFFSET;
                        var y = photon.getY();
                        var position = this._position.set(x, y);
                        var orientation = photon.get('orientation');
                        var speed = Constants.PHOTON_INITIAL_SPEED;
                        
                        // Create and emit a photon
                        success = true;
                        this.firePhotonEmitted(Photon.create({
                            wavelength: wavelength, 
                            position: position, 
                            orientation: orientation, 
                            speed: speed, 
                            emitted: true
                        }));
                        
                        if (BohrModel.DEBUG_OUTPUT_ENABLED)
                            console.log('BohrModel: stimulated emission of photon, wavelength=' + wavelength);
                        
                        // move electron to new state
                        this.setElectronState(newState);
                    }
                }
            }
            
            return success;
        },
        
        /**
         * Probabilistically determines whether the atom will emit a photon via stimulated emission.
         */
        stimulatedEmissionIsCertain: function() {
            return Math.random() < BohrModel.PHOTON_STIMULATED_EMISSION_PROBABILITY;
        },
        
        /**
         * Determines if a proposed state transition caused by stimulated emission is legal.
         * A Bohr transition is legal if the 2 states are different and n >= ground state.
         */
        stimulatedEmissionIsAllowed: function(nOld, nNew) {
            return (
                (nOld !== nNew) && 
                (nNew >= BohrModel.GROUND_STATE)
            );
        },

        /**
         * Attempts to emit a photon from the electron's location, at a random orientation.
         */
        attemptSpontaneousEmission: function() {
            var success = false;
            
            if (!BohrModel.DEBUG_SPONTANEOUS_EMISSION_ENABLED)
                return false;
            
            // Are we in some state other than the ground state?
            // Has the electron been in this state awhile?
            if (this.get('electronState') > BohrModel.GROUND_STATE && this.timeInState >= BohrModel.MIN_TIME_IN_STATE) {
                //  Emit a photon with some probability...
                if (this.spontaneousEmissionIsCertain()) {
                    
                    var newState = this.chooseLowerElectronState();
                    if (newState === -1) {
                        // For some subclasses, there may be no valid transition.
                        return false;
                    }
                    
                    // New photon's properties
                    var position = this.getSpontaneousEmissionPosition();
                    var orientation = RandomUtils.randomAngle();
                    var speed = Constants.PHOTON_INITIAL_SPEED;
                    var wavelength = BohrModel.getWavelengthEmitted(this.get('electronState'), newState);
                    
                    // Create and emit a photon
                    success = true;
                    this.firePhotonEmitted(Photon.create({
                        wavelength: wavelength, 
                        position: position, 
                        orientation: orientation, 
                        speed: speed, 
                        emitted: true
                    }));
                    
                    if (BohrModel.DEBUG_OUTPUT_ENABLED)
                        console.log('BohrModel: spontaneous emission of photon, wavelength=' + wavelength);
                    
                    // Move electron to new state
                    this.setElectronState(newState);
                }
            }
            
            return success;
        },
        
        /*
         * Probabilistically determines whether not the atom will spontaneously emit a photon.
         */
        spontaneousEmissionIsCertain: function() {
            return Math.random() < BohrModel.PHOTON_SPONTANEOUS_EMISSION_PROBABILITY;
        },
        
        /*
         * Chooses a new state for the electron.
         * The state chosen is a lower state.
         * This is used when moving to a lower state, during spontaneous emission.
         * Each lower state has the same probability of being chosen.
         */
        chooseLowerElectronState: function() {
            var newState = BohrModel.GROUND_STATE;
            if (this.get('electronState') > BohrModel.GROUND_STATE + 1)
                newState = BohrModel.GROUND_STATE + Math.floor(Math.random() * (this.get('electronState') - BohrModel.GROUND_STATE));
            return newState;
        },
        
        /*
         * Gets the position of a photon created via spontaneous emission.
         * The default behavior is to create the photon at the electron's position.
         * This returns a reference to a Point2D -- be careful not to modify 
         * the value returned!
         */
        getSpontaneousEmissionPosition: function() {
            return this.electronPosition;
        },

        /**
         * Gets the transition wavelengths for a specified state.
         */
        getTransitionWavelengths: function(state) {
            var wavelengths = null;
            var maxState = BohrModel.getGroundState() + BohrModel.getNumberOfStates() - 1;
            if (state < maxState) {
                wavelengths = [];
                for (var i = 0; i < maxState - state; i++)
                    wavelengths[i] = BohrModel.getWavelengthAbsorbed(state, state + i + 1);
            }
            return wavelengths;
        }

    }, _.extend({}, Constants.BohrModel, {

        /**
         * Gets the number of electron states that the model supports.
         * This is the same as the number of orbits.
         * @return int
         */
        getNumberOfStates: function() {
            return BohrModel.ORBIT_RADII.length;
        },

        /**
         * Gets the radius for a specified state.
         */
        getOrbitRadius: function(state) {
            return BohrModel.ORBIT_RADII[state - BohrModel.GROUND_STATE];
        },

        /**
         * Creates radii for N orbits.
         * This is the physically correct way to specify the orbits.
         * In this sim, we use distorted orbits, so this method is not used.
         * We keep it here for historical purposes.
         */
        createOrbitRadii: function(numberOfOrbits, groundOrbitRadius) {
            var radii = [];
            for (var n = 1; n <= numberOfOrbits; n++)
                radii[n - 1] = n * n * groundOrbitRadius;
            return radii;
        },
        
        /**
         * Gets the wavelength that must be absorbed for the electron to transition
         * from state nOld to state nNew, where nOld < nNew.
         * This algorithm assumes that the ground state is 1.
         */
        getWavelengthAbsorbed: function(nOld, nNew) {
            if (!(
                (BohrModel.GROUND_STATE == 1) &&
                (nOld < nNew) &&
                (nOld > 0) &&
                (nNew <= BohrModel.GROUND_STATE + BohrModel.getNumberOfStates() - 1)
            )) {
                throw 'Bad states for getWavelengthAbsorbed';
            }

            return 1240.0 / (
                13.6 * ((1.0 / (nOld * nOld)) - (1.0 / (nNew * nNew)))
            );
        },
        
        /**
         * Gets the wavelength that is emitted when the electron transitions
         *   from state nOld to state nNew, where newNew < nOld.
         */
        getWavelengthEmitted: function(nOld, nNew) {
            return BohrModel.getWavelengthAbsorbed(nNew, nOld);
        },
        
        /**
         * Gets the wavelength that causes a transition between 2 specified states.
         */
        getTransitionWavelength: function(nOld, nNew) {
            if (nOld === nNew)
                throw 'nOld cannot equal nNew';
            
            if (nNew < nOld)
                return BohrModel.getWavelengthEmitted(nOld, nNew);
            else
                return BohrModel.getWavelengthAbsorbed(nOld, nNew);
        },

        /**
         * Gets the set of wavelengths that cause a state transition.
         * When firing white light, the gun prefers to firing these wavelengths
         *   so that the probability of seeing a photon absorbed is higher.
         */
        getTransitionWavelengths: function(minWavelength, maxWavelength) {
            // Create the set of wavelengths, include only those between min and max.
            var wavelengths = [];
            var n = BohrModel.getNumberOfStates();
            var g = BohrModel.getGroundState();
            for (var i = g; i < g + n - 1; i++) {
                for (var j = i + 1; j < g + n; j++) {
                    var wavelength = this.getWavelengthAbsorbed(i, j);
                    if (wavelength >= minWavelength && wavelength <= maxWavelength)
                        wavelengths.push(wavelength);
                }
            }
            return wavelengths;
        }

    }));

    return BohrModel;
});