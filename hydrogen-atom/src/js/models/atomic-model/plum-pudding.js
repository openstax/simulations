define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2     = require('common/math/vector2');
    var RandomUtils = require('common/math/random-utils');

    var AbstractAtomicModel  = require('hydrogen-atom/models/atomic-model');
    var Photon               = require('hydrogen-atom/models/photon');
    var RutherfordScattering = require('hydrogen-atom/models/rutherford-scattering');
    
    var Constants = require('constants');

    /**
     * PlumPuddingModel models the hydrogen atom as plum pudding.
     * 
     * Physical representation:
     *   The proton is a blob of pudding (or "goo"), modeled as a circle.
     *   An electron oscillates inside the goo along a straight line 
     *   that passes through the center of the goo and has its end points
     *   on the circle.  
     * 
     * Collision behavior:
     *   Photons collide with the electron when they are "close".
     *   Alpha particles collide with the goo and are deflected 
     *   using a Rutherford scattering algorithm.
     * 
     * Absorption behavior:
     *   The electron can absorb N photons.
     *   When any photon collides with the electron, it is absorbed with
     *   some probability, and (if absorbed) causes the electron to start oscillating.
     *   Alpha particles are not absorbed.
     * 
     * Emission behavior:
     *   The electron can emit one UV photon for each photon absorbed.
     *   Photons are emitted at the electron's location.
     *   No photons are emitted until the electron has completed one
     *   oscillation cycle, and after emitting its last photon,
     *   the electron completes its current oscillation cycles,
     *   coming to rest at the atoms center.
     *   Alpha particles are not emitted.
     */
    var PlumPuddingModel = AbstractAtomicModel.extend({

        defaults: _.extend({}, AbstractAtomicModel.prototype.defaults, {
            // Radius of the atom's goo
            radius: Constants.PlumPuddingModel.DEFAULT_RADIUS
        }),

        initialize: function(attributes, options) {
            AbstractAtomicModel.prototype.initialize.apply(this, [attributes, options]);

            // number of photons the atom has absorbed and is "holding"
            this.numberOfPhotonsAbsorbed = 0;
            // offset of the electron relative to atom's center
            this.electronOffset = new Vector2();
            // electron's position in world coordinates
            this.electronPosition = new Vector2();
            // line on which the electron oscillates, relative to atom's center
            this.electronLineStart = new Vector2();
            this.electronLineEnd = new Vector2();
            // the electron's direction of motion, relative to the X (horizontal) axis
            this.electronDirectionPositive = false;
            
            // is the electron moving?
            this.electronIsMoving = false;
            // how many times has the electron crossed the atom's center since it started moving?
            this.numberOfZeroCrossings = 0;
            // the amplitude of the electron just before emitting its last photon
            this.previousAmplitude = 0;


            this.updateElectronLine();
        },

        /**
         * Updates the line that determines the electron's oscillation path
         *   when the electron is moving at maximum amplitude.  The line is
         *   specified in coordinates relative to the atom's center.
         */
        updateElectronLine: function() {
            var angle = RandomUtils.randomAngle();
            var x = Math.abs(this.get('radius') * Math.sin(angle));
            var y = RandomUtils.randomSign() * this.get('radius') * Math.cos(angle);
            this.electronLineStart.set(-x, -y);
            this.electronLineEnd.set(x, y);
            
            if (this.electronLineStart.x >= this.electronLineEnd.x) // required by moveElectron()
                throw 'Starting x must be greater than ending x';
            
            this.electronDirectionPositive = RandomUtils.randomBoolean();
            
            // move electron back to center
            this.setElectronOffset(0, 0);
        },

        /**
         * Sets the electron's offset (and position).
         */
        setElectronOffset: function(xOffset, yOffset) {
            this.electronOffset.set(xOffset, yOffset);
            this.electronPosition.set(this.getX() + xOffset, this.getY() + yOffset);
        },

        /**
         * Gets the electron's amplitude.
         * This is ratio of the number of photons actually absorbed to
         *   the number of photons the electron is capable of absorbing.
         */
        getElectronAmplitude: function() {
            return (this.numberOfPhotonsAbsorbed / AbstractAtomicModel.MAX_PHOTONS_ABSORBED);
        },
        
        /**
         * Gets the sign (+-) that corresponds to the electron's direction.
         *   +x is to the right, +y is down.
         */
        getElectronDirectionSign: function() {
            return ((this.electronDirectionPositive === true) ? +1 : -1);
        },
        
        /**
         * Changes the electron's direction.
         */
        changeElectronDirection: function() {
            this.electronDirectionPositive = !this.electronDirectionPositive;
        },
        
        /**
         * Gets the number of oscillations that the electron has completed 
         * since it started moving. This is a function of the number of times
         * the electron has crossed the center of the atom.
         */
        getNumberOfElectronOscillations: function() {
            return (this.numberOfZeroCrossings % 2);
        },
        
        /**
         * Determines if the sign (+-) on two numbers is different.
         */
        signIsDifferent: function(d1, d2) {
            return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0));
        },
        
        //----------------------------------------------------------------------------
        // Photon absorption and emission
        //----------------------------------------------------------------------------
        
        /**
         * Cannot absorb a photon if any of these are true:
         *   - the photon was emitted by the atom
         *   - we've already absorbed the max
         *   - we've emitted out last photon and haven't completed oscillation.
         */
        canAbsorb: function(photon) {
            return !(photon.isEmitted() || 
                this.numberOfPhotonsAbsorbed === AbstractAtomicModel.MAX_PHOTONS_ABSORBED || (
                    this.numberOfPhotonsAbsorbed === 0 && 
                    this.electronIsMoving
                )
            );
        },
        
        /**
         * Attempts to absorb the specified photon.
         */
        absorbPhoton: function(photon) {
            var absorbed = false;
            if (this.canAbsorb(photon)) {
                var photonPosition = photon.getPosition();
                if (this.pointsCollide(this.electronPosition, photonPosition, AbstractAtomicModel.COLLISION_CLOSENESS)) {
                    if (Math.random() < AbstractAtomicModel.PHOTON_ABSORPTION_PROBABILITY) {
                        this.numberOfPhotonsAbsorbed++;
                        if (this.numberOfPhotonsAbsorbed > AbstractAtomicModel.MAX_PHOTONS_ABSORBED)
                            throw 'Number of photons has exceeded the max allowed';
                        this.firePhotonAbsorbed(photon);
                        absorbed = true;
                    }
                }
            }
            return absorbed;
        },
        
        /**
         * Emits a photon from the electron's location, at a random orientation.
         */
        emitPhoton: function() {
            if (this.numberOfPhotonsAbsorbed > 0) {
                this.numberOfPhotonsAbsorbed--;
                
                // Use the electron's position
                var position = this.electronPosition;
                // Pick a random orientation
                var orientation = RandomUtils.randomAngle();
                var speed = Constants.PHOTON_INITIAL_SPEED;
                
                // Create and emit a photon
                this.firePhotonEmitted(Photon.create({
                    wavelength: AbstractAtomicModel.PHOTON_EMISSION_WAVELENGTH, 
                    position: position, 
                    orientation: orientation, 
                    speed: speed, 
                    emitted: true
                }));
            }
        },

        /**
         * Tries to absorb the photon.
         * If it's not absorbed, the photon is moved.
         */
        movePhoton: function(photon, deltaTime) {
            var absorbed = this.absorbPhoton(photon);
            if (!absorbed)
                AbstractAtomicModel.prototype.movePhoton.apply(this, arguments);
        },

        /**
         * Moves an alpha particle using a Rutherford Scattering algorithm.
         * 
         * WORKAROUND -
         *   If the particle is "close" to the atom's center, then it simply
         *   passes through at constant speed.  This is a workaround for a 
         *   problem in RutherfordScattering; particles get stuck at the 
         *   center of the plum pudding atom, or they seem to stick slightly
         *   and then accelerate off.  The value of "closeness" was set 
         *   through trial and error, to eliminate these problems while still
         *   making the motion look continuous. This workaround assumes that 
         *   alpha particles are moving vertically from bottom to top.
         */
        moveAlphaParticle: function(alphaParticle, deltaTime) {
            var closeness = 10;
            if (Math.abs(alphaParticle.getX() - this.getX()) < closeness)
                AbstractAtomicModel.prototype.moveAlphaParticle.apply(this, arguments);
            else
                RutherfordScattering.moveParticle(this, alphaParticle, deltaTime, true);
        },

    }, Constants.PlumPuddingModel);

    return PlumPuddingModel;
});