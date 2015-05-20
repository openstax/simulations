define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * Constants
     */
    var MIN_PHOTON_HOLD_TIME = 600;  // Milliseconds of sim time.
    var MAX_PHOTON_HOLD_TIME = 1200; // Milliseconds of sim time.

    /**
     * This is the base class for the strategies that define how a molecule
     *   reacts to a given photon.  It is responsible for the following:
     *
     *   - Whether a given photon should be absorbed.
     *   - How the molecule reacts to the absorption,, i.e. whether it vibrates,
     *     rotates, breaks apart, etc.
     *   - Maintenance of any counters or timers associated with the reaction to
     *     the absorption, such as those related to re-emission of an absorbed
     *     photon.
     */
    var PhotonAbsorptionStrategy = function(molecule) {
        // Property that contains the probability that a given photon will be
        //   absorbed.  It is a property rather than a simple constant so that
        //   it can be hooked up to developer controls, since this was requested
        //   during the development process.
        this.photonAbsorptionProbability = 0.5;
        this.molecule = molecule;
        // Variables involved in the holding and re-emitting of photons.
        this.absorbedPhoton = null;
        this.isPhotonAbsorbed = false;
        this.photonHoldCountdownTime = 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(PhotonAbsorptionStrategy.prototype, {

        /**
         * Step the strategy forward in time by the given time.
         */
        update: function(deltaTime) {},

        /**
         *  Reset the strategy. In most cases, this will need to be
         *    overridden in the descendant classes, but those over-
         *    rides should also call this one.
         */
        reset: function() {
            this.absorbedPhoton = null;
            this.photonJustAbsorbed = false;
            this.photonHoldCountdownTime = 0;
        },

        /**
         * Returns whether the provided photon should be absorbed.
         *   By design, a given photon should only be requested 
         *   once, not multiple times.
         */
        shouldAbsorbPhoton: function(photon) {
            // All circumstances are correct for photon absorption,
            //   so now we decide probabilistically whether or not
            //   to actually do it.  This essentially simulates the
            //   quantum nature of the absorption.
            return (!this.photonJustAbsorbed && Math.random() < this.photonAbsorptionProbability);
        },

        /**
         * Absorbs a given photon.
         */
        absorbPhoton: function(photon) {
            this.photonJustAbsorbed = true;
            this.photonHoldCountdownTime = MIN_PHOTON_HOLD_TIME + Math.random() * (MAX_PHOTON_HOLD_TIME - MIN_PHOTON_HOLD_TIME);
        },

        /**
         * Returns whether or not a photon has been absorbed.
         */
        isPhotonAbsorbed: function() {
            return this.photonJustAbsorbed;
        }

    });


    
    /**
     * Photon absorption strategy that causes a molecule to hold a
     *   photon once is has absorbed it, then after some amount of
     *   time re-emit it.
     */
    var PhotonHoldStrategy = function(molecule) {
        PhotonAbsorptionStrategy.apply(this, arguments);
    };

    _.extend(PhotonHoldStrategy.prototype, PhotonAbsorptionStrategy.prototype, {

        /**
         * Step the strategy forward in time by the given time.
         */
        update: function(deltaTime) {
            this.photonHoldCountdownTime -= deltaTime;
            if (this.photonHoldCountdownTime <= 0)
                this.reemitPhoton();
        },

        /**
         * Reemits a photon
         */
        reemitPhoton: function() {
            this.molecule.emitPhoton(this.absorbedWavelength);
            this.molecule.resetPhotonAbsorptionStrategy();
            this.photonJustAbsorbed = false;
        },

        /**
         * Absorbs a given photon.
         */
        absorbPhoton: function(photon) {
            this.absorbedWavelength = photon.get('wavelength');
            this.photonAbsorbed();
        },

        /**
         * Called when photon is absorbed
         */
        photonAbsorbed: function() {}

    });



    /**
     * Photon absorption strategy that causes a molecule to vibrate
     *   after absorbing a photon, and re-emit the photon after
     *   some length of time.
     */
    var VibrationStrategy = function(molecule) {
        PhotonHoldStrategy.apply(this, arguments);
    };

    _.extend(VibrationStrategy.prototype, PhotonHoldStrategy.prototype, {

        /**
         * Reemits a photon
         */
        reemitPhoton: function() {
            PhotonHoldStrategy.prototype.reemitPhoton.apply(this, arguments);
            this.molecule.set('vibrating', false);
            this.molecule.vibrate(0);
        },

        /**
         * Called when photon is absorbed
         */
        photonAbsorbed: function() {
            this.molecule.set('vibrating', true);
        }

    });



    /**
     * Photon absorption strategy that causes a molecule to rotate
     *   after absorbing a photon, and re-emit the photon after
     *   some length of time.
     */
    var RotationStrategy = function(molecule) {
        PhotonHoldStrategy.apply(this, arguments);
    };

    _.extend(RotationStrategy.prototype, PhotonHoldStrategy.prototype, {

        /**
         * Reemits a photon
         */
        reemitPhoton: function() {
            PhotonHoldStrategy.prototype.reemitPhoton.apply(this, arguments);
            this.molecule.set('rotating', false);
        },

        /**
         * Called when photon is absorbed
         */
        photonAbsorbed: function() {
            this.molecule.set('rotationDirectionClockwise', Math.random() <= 0.5);
            this.molecule.set('rotating', true);
        }

    });



    /**
     * Photon absorption strategy that causes a molecule to break
     *   apart after absorbing a photon.
     */
    var BreakApartStrategy = function(molecule) {
        PhotonAbsorptionStrategy.apply(this, arguments);
    };

    _.extend(BreakApartStrategy.prototype, PhotonAbsorptionStrategy.prototype, {

        /**
         * Step the strategy forward in time by the given time.
         */
        update: function(deltaTime) {
            PhotonHoldStrategy.prototype.update.apply(this, arguments);
            // Basically, all this strategy does is to instruct the
            //   molecule to break apart, then reset the strategy.
            this.molecule.breakApart();
            this.molecule.resetPhotonAbsorptionStrategy();
        },

    });



    /**
     * Photon absorption strategy that causes a molecule to enter
     *   an exited state after absorbing a photon, and then re-emit
     *   the photon after some length of time.  At the time of this
     *   writing, and "excited state" is depicted in the view as a
     *   glow that surrounds the molecule.
     */
    var ExcitationStrategy = function(molecule) {
        PhotonHoldStrategy.apply(this, arguments);
    };

    _.extend(ExcitationStrategy.prototype, PhotonHoldStrategy.prototype, {

        /**
         * Reemits a photon
         */
        reemitPhoton: function() {
            PhotonHoldStrategy.prototype.reemitPhoton.apply(this, arguments);
            this.molecule.set('highElectronicEnergyState', false);
        },

        /**
         * Called when photon is absorbed
         */
        photonAbsorbed: function() {
            this.molecule.set('highElectronicEnergyState', true);
        }

    });



    /**
     * Photon absorption strategy that does nothing, meaning that
     *   it will never cause a photon to be absorbed.
     */
    var NullPhotonAbsorptionStrategy = function(molecule) {
        PhotonAbsorptionStrategy.apply(this, arguments);
    };

    _.extend(NullPhotonAbsorptionStrategy.prototype, PhotonAbsorptionStrategy.prototype, {

        /**
         * Does nothing.
         */
        update: function(deltaTime) {},

        /**
         * This strategy never absorbes.
         */
        shouldAbsorbPhoton: function(photon) {
            return false;
        },

        /**
         * Do nothing.
         */
        absorbPhoton: function(photon) {},

    });



    // Put everything in the PhotonAbsorptionStrategy
    PhotonAbsorptionStrategy.PhotonHoldStrategy           = PhotonHoldStrategy;
    PhotonAbsorptionStrategy.VibrationStrategy            = VibrationStrategy;
    PhotonAbsorptionStrategy.RotationStrategy             = RotationStrategy;
    PhotonAbsorptionStrategy.BreakApartStrategy           = BreakApartStrategy;
    PhotonAbsorptionStrategy.ExcitationStrategy           = ExcitationStrategy;
    PhotonAbsorptionStrategy.NullPhotonAbsorptionStrategy = NullPhotonAbsorptionStrategy;


    return PhotonAbsorptionStrategy;
});
