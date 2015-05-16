define(function (require) {

    'use strict';

    var PhotonAbsorptionStrategy = require('models/photon-absorption-strategy');
    var Molecule                 = require('models/molecule');
    var CarbonAtom               = require('models/atom/carbon');
    var HydrogenAtom             = require('models/atom/hydrogen');
    var AtomicBond               = require('models/atomic-bond');

    var Constants = require('constants');

    var INITIAL_CARBON_H_DISTANCE = 170; // In picometers.
    // Assume that the angle from the carbon to the hydrogen is 45 degrees.
    var ROTATED_INITIAL_C_H_DISTANCE = INITIAL_CARBON_H_DISTANCE * Math.sin(Math.PI / 4);
    var H_VIBRATION_DISTANCE = 30;
    var H_VIBRATION_ANGLE = Math.PI / 4;
    var H_VIBRATION_DISTANCE_X = H_VIBRATION_DISTANCE * Math.cos(H_VIBRATION_ANGLE);
    var H_VIBRATION_DISTANCE_Y = H_VIBRATION_DISTANCE * Math.sin(H_VIBRATION_ANGLE);

    /**
     * Represents a methane molecule.
     */
    var CH4 = Molecule.extend({

        initialize: function(attributes, options) {
            Molecule.prototype.initialize.apply(this, arguments);

            // Create and add atoms
            this.carbonAtom    = this.addAtom(new CarbonAtom());
            this.hydrogenAtom1 = this.addAtom(new HydrogenAtom());
            this.hydrogenAtom2 = this.addAtom(new HydrogenAtom());
            this.hydrogenAtom3 = this.addAtom(new HydrogenAtom());
            this.hydrogenAtom4 = this.addAtom(new HydrogenAtom());

            // Create and add bonds
            this.addAtomicBond(new AtomicBond(this.carbonAtom, this.hydrogenAtom1, 1));
            this.addAtomicBond(new AtomicBond(this.carbonAtom, this.hydrogenAtom2, 1));
            this.addAtomicBond(new AtomicBond(this.carbonAtom, this.hydrogenAtom3, 1));
            this.addAtomicBond(new AtomicBond(this.carbonAtom, this.hydrogenAtom4, 1));

            // Set up the photon wavelengths to absorb.
            this.addPhotonAbsorptionStrategy(Constants.IR_WAVELENGTH, new PhotonAbsorptionStrategy.VibrationStrategy(this));

            // Set the initial offsets.
            this.initAtomOffsets();
        },

        /**
         * Initialize sthe offsets from the center of gravity for each atom
         *   within this molecule.
         */
        initAtomOffsets: function() {
            this.getInitialAtomCogOffset(this.carbonAtom).set(0, 0);
            this.getInitialAtomCogOffset(this.hydrogenAtom1).set(-ROTATED_INITIAL_C_H_DISTANCE,  ROTATED_INITIAL_C_H_DISTANCE);
            this.getInitialAtomCogOffset(this.hydrogenAtom2).set( ROTATED_INITIAL_C_H_DISTANCE,  ROTATED_INITIAL_C_H_DISTANCE);
            this.getInitialAtomCogOffset(this.hydrogenAtom3).set( ROTATED_INITIAL_C_H_DISTANCE, -ROTATED_INITIAL_C_H_DISTANCE);
            this.getInitialAtomCogOffset(this.hydrogenAtom4).set(-ROTATED_INITIAL_C_H_DISTANCE, -ROTATED_INITIAL_C_H_DISTANCE);

            this.updateAtomPositions();
        },

        /**
         * Set the angle, in terms of radians from 0 to 2*PI, where this
         *   molecule is in its vibration sequence.  This implements no
         *   actual vibration by default but can be overridden in child
         *   classes as needed.
         */
        vibrate: function(vibrationRadians) {
            Molecule.prototype.vibrate.apply(this, arguments);

            if (vibrationRadians !== 0) {
                var multFactor = Math.sin(vibrationRadians);

                this.getInitialAtomCogOffset(this.hydrogenAtom1).set(
                    -ROTATED_INITIAL_C_H_DISTANCE + multFactor * H_VIBRATION_DISTANCE_X,  
                     ROTATED_INITIAL_C_H_DISTANCE + multFactor * H_VIBRATION_DISTANCE_Y
                );
                this.getInitialAtomCogOffset(this.hydrogenAtom2).set(
                    ROTATED_INITIAL_C_H_DISTANCE - multFactor * H_VIBRATION_DISTANCE_X,  
                    ROTATED_INITIAL_C_H_DISTANCE + multFactor * H_VIBRATION_DISTANCE_Y
                );
                this.getInitialAtomCogOffset(this.hydrogenAtom3).set(
                    -ROTATED_INITIAL_C_H_DISTANCE - multFactor * H_VIBRATION_DISTANCE_X, 
                    -ROTATED_INITIAL_C_H_DISTANCE + multFactor * H_VIBRATION_DISTANCE_Y
                );
                this.getInitialAtomCogOffset(this.hydrogenAtom4).set(
                    ROTATED_INITIAL_C_H_DISTANCE + multFactor * H_VIBRATION_DISTANCE_X, 
                    -ROTATED_INITIAL_C_H_DISTANCE + multFactor * H_VIBRATION_DISTANCE_Y
                );

                // Position the carbon atom so that the center of mass of
                //   the molecule remains the same.
                var carbonXPos = -(HydrogenAtom.MASS / CarbonAtom.MASS) * (
                    this.getInitialAtomCogOffset(this.hydrogenAtom1).x +
                    this.getInitialAtomCogOffset(this.hydrogenAtom2).x +
                    this.getInitialAtomCogOffset(this.hydrogenAtom3).x +
                    this.getInitialAtomCogOffset(this.hydrogenAtom4).x
                );
                var carbonYPos = -(HydrogenAtom.MASS / CarbonAtom.MASS) * (
                    this.getInitialAtomCogOffset(this.hydrogenAtom1).y +
                    this.getInitialAtomCogOffset(this.hydrogenAtom2).y +
                    this.getInitialAtomCogOffset(this.hydrogenAtom3).y +
                    this.getInitialAtomCogOffset(this.hydrogenAtom4).y
                );
                this.getInitialAtomCogOffset(this.carbonAtom).set(carbonXPos, carbonYPos);
            }
            else {
                this.initAtomOffsets();
            }

            this.updateAtomPositions();
        }

    });

    return CH4;
});
