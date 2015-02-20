
define(function(require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var VerletAlgorithm = require('../verlet-algorithm');
    var WaterAtomPositionUpdater = require('models/atom-position-updater/water');

    var Constants = require('constants');

    /**
     * Implementation of the Verlet algorithm for simulating molecular interaction
     *   based on the Lennard-Jones potential.  This version is used specifically
     *   for simulating water, i.e. H2O.
     */
    var WaterVerletAlgorithm = function(simulation) {
        VerletAlgorithm.apply(this, [simulation]);

        this.positionUpdater = WaterAtomPositionUpdater;
    };

    _.extend(WaterVerletAlgorithm.prototype, VerletAlgorithm.prototype, {

        updateForcesAndMotion: function() {

            // Obtain references to the model data and parameters so that we can
            //   perform fast manipulations.
            var simulation                    = this.simulation;
            var moleculeDataSet               = simulation.moleculeDataSet;
            var numberOfMolecules             = moleculeDataSet.getNumberOfMolecules();
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var atomPositions                 = moleculeDataSet.atomPositions;
            var moleculeVelocities            = moleculeDataSet.moleculeVelocities;
            var moleculeForces                = moleculeDataSet.moleculeForces;
            var nextMoleculeForces            = moleculeDataSet.nextMoleculeForces;
            var moleculeRotationAngles        = moleculeDataSet.moleculeRotationAngles;
            var moleculeRotationRates         = moleculeDataSet.moleculeRotationRates;
            var moleculeTorques               = moleculeDataSet.moleculeTorques;
            var nextMoleculeTorques           = moleculeDataSet.nextMoleculeTorques;

            // Initialize other values that will be needed for the calculation.
            var massInverse = 1 / moleculeDataSet.moleculeMass;
            var inertiaInverse = 1 / moleculeDataSet.moleculeRotationalInertia;
            var normalizedContainerHeight = simulation.getNormalizedContainerHeight();
            var normalizedContainerWidth = simulation.getNormalizedContainerWidth();
            var gravitationalAcceleration = simulation.getGravitationalAcceleration();
            var temperatureSetPoint = simulation.get('temperatureSetPoint');

            // Update center of mass positions and angles for the molecules.
            this._updateCenterOfMassPositions(
                numberOfMolecules, 
                moleculeCenterOfMassPositions, 
                moleculeVelocities, 
                moleculeForces, 
                moleculeRotationRates, 
                moleculeTorques, 
                massInverse, 
                inertiaInverse
            );

            this.positionUpdater.updateAtomPositions(moleculeDataSet);

            // Calculate the force from the walls.  This force is assumed to act
            //    on the center of mass, so there is no torque.
            var pressureZoneWallForce = this._calculateWallAndGravityForces(
                nextMoleculeForces, 
                nextMoleculeTorques, 
                numberOfMolecules, 
                moleculeCenterOfMassPositions, 
                normalizedContainerWidth, 
                normalizedContainerHeight, 
                gravitationalAcceleration, 
                temperatureSetPoint
            );

            // Update the pressure calculation.
            this.updatePressure(pressureZoneWallForce);

            // If there are any atoms that are currently designated as "unsafe",
            // check them to see if they can be moved into the "safe" category.
            if (moleculeDataSet.numberOfSafeMolecules < numberOfMolecules)
                this.updateMoleculeSafety();

            // Calculate the force and torque due to inter-particle interactions.
            this._calculateInteractionForces(
                nextMoleculeForces, 
                moleculeDataSet.numberOfSafeMolecules, 
                moleculeCenterOfMassPositions, 
                temperatureSetPoint
            );

            // Update the velocities and rotation rates and calculate kinetic
            // energy.
            this._calculateVelocitiesAndRotationRates(
                moleculeVelocities, 
                moleculeRotationRates, 
                numberOfMolecules, 
                moleculeForces, 
                nextMoleculeForces, 
                moleculeDataSet.moleculeMass, 
                moleculeDataSet.moleculeRotationalInertia, 
                nextMoleculeTorques, 
                massInverse, 
                inertiaInverse
            );
        },

        /**
         * Determines based on the temperature what value of electrostatic
         *   force to be used in a Coulomb's law equation.
         */
        determineElectrostaticForce: function(temperatureSetPoint) {
            var q0;

            if (temperatureSetPoint < VerletAlgorithm.WATER_FULLY_FROZEN_TEMPERATURE) {
                // Use stronger electrostatic forces in order to create more of
                // a crystal structure.
                q0 = VerletAlgorithm.WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE;
            }
            else if (temperatureSetPoint > VerletAlgorithm.WATER_FULLY_MELTED_TEMPERATURE) {
                // Use weaker electrostatic forces in order to create more of an
                // appearance of liquid.
                q0 = VerletAlgorithm.WATER_FULLY_MELTED_ELECTROSTATIC_FORCE;
            }
            else {
                // We are somewhere in between the temperature for being fully
                // melted or frozen, so scale accordingly.
                var temperatureFactor = (temperatureSetPoint - VerletAlgorithm.WATER_FULLY_FROZEN_TEMPERATURE) / (
                    VerletAlgorithm.WATER_FULLY_MELTED_TEMPERATURE - VerletAlgorithm.WATER_FULLY_FROZEN_TEMPERATURE
                );

                q0 = VerletAlgorithm.WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE - (
                    temperatureFactor * (
                        VerletAlgorithm.WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE - VerletAlgorithm.WATER_FULLY_MELTED_ELECTROSTATIC_FORCE
                    )
                );
            }

            return q0;
        },

        /**
         * Updates center of mass positions and angles for the molecules.
         */
        _updateCenterOfMassPositions: function(numberOfMolecules, moleculeCenterOfMassPositions, moleculeVelocities, moleculeForces, moleculeRotationRates, moleculeTorques, massInverse, inertiaInverse) {
            for (var i = 0; i < numberOfMolecules; i++) {

                var xPos = moleculeCenterOfMassPositions[i].x + 
                    (VerletAlgorithm.TIME_STEP * moleculeVelocities[i].x) + 
                    (VerletAlgorithm.TIME_STEP_SQR_HALF * moleculeForces[i].x * massInverse);

                var yPos = moleculeCenterOfMassPositions[i].y + 
                    (VerletAlgorithm.TIME_STEP * moleculeVelocities[i].y) +
                    (VerletAlgorithm.TIME_STEP_SQR_HALF * moleculeForces[i].y * massInverse);

                moleculeCenterOfMassPositions[i].set(xPos, yPos);

                moleculeRotationAngles[i] += (VerletAlgorithm.TIME_STEP * moleculeRotationRates[i]) +
                                             (VerletAlgorithm.TIME_STEP_SQR_HALF * moleculeTorques[i] * inertiaInverse);
            }
        },

        /**
         * Calculates the force from the walls.  This force is assumed to 
         *   act on the center of mass, so there is no torque.
         */
        _calculateWallAndGravityForces: function(nextMoleculeForces, nextMoleculeTorques, numberOfMolecules, moleculeCenterOfMassPositions, normalizedContainerWidth, normalizedContainerHeight, gravitationalAcceleration, temperatureSetPoint) {
            var pressureZoneWallForce = 0;

            for (var i = 0; i < numberOfMolecules; i++) {

                // Clear the previous calculation's particle forces and torques.
                nextMoleculeForces[i].set(0, 0);
                nextMoleculeTorques[i] = 0;

                // Get the force values caused by the container walls.
                this.calculateWallForce(
                    moleculeCenterOfMassPositions[i], 
                    normalizedContainerWidth, 
                    normalizedContainerHeight,
                    nextMoleculeForces[i]
                );

                // Accumulate this force value as part of the pressure being
                // exerted on the walls of the container.
                if (nextMoleculeForces[i].y < 0) {
                    pressureZoneWallForce += -nextMoleculeForces[i].y;
                }
                else if (moleculeCenterOfMassPositions[i].y > normalizedContainerHeight / 2) {
                    // If the particle bounced on one of the walls above the midpoint, add
                    // in that value to the pressure.
                    pressureZoneWallForce += Math.abs(nextMoleculeForces[i].x);
                }

                // Add in the effect of gravity.
                var _gravitationalAcceleration = gravitationalAcceleration;
                if (temperatureSetPoint < VerletAlgorithm.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES) {
                    // Below a certain temperature, gravity is increased to counteract some odd-looking behavior
                    // caused by the thermostat.
                    _gravitationalAcceleration = gravitationalAcceleration *
                        ((VerletAlgorithm.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES - temperatureSetPoint) *
                        VerletAlgorithm.LOW_TEMPERATURE_GRAVITY_INCREASE_RATE + 1);
                }
                nextMoleculeForces[i].y = nextMoleculeForces[i].y - _gravitationalAcceleration;
            }

            return pressureZoneWallForce;
        },

        /**
         * Calculates the force and torque due to inter-particle interactions.
         */
        _calculateInteractionForces: function(nextMoleculeForces, numberOfSafeMolecules, moleculeCenterOfMassPositions, temperatureSetPoint) {
            //var potentialEnergy = 0;

            // Set up the values for the charges that will be used when
            //   calculating the coloumb interactions.
            var q0 = this.determineElectrostaticForce(temperatureSetPoint);
            var normalCharges  = [ -2 * q0, q0, q0 ];
            var alteredCharges = [ -2 * q0, 1.67 * q0, 0.33 * q0 ];

            var force = new Vector2();
            for (var i = 0; i < numberOfSafeMolecules; i++) {
                // Select which charges to use for this molecule.  This is part
                //    ofthe "hollywooding" to make the solid form appear more
                //    crystalline.
                var chargesA = (i % 2 === 0) ? normalCharges : alteredCharges;

                for (var j = i + 1; j < numberOfSafeMolecules; j++) {
                    // Select charges for this molecule.
                    var chargesB = (j % 2 === 0) ? normalCharges : alteredCharges;

                    // Calculate Lennard-Jones potential between mass centers.
                    var dx = moleculeCenterOfMassPositions[i].x - moleculeCenterOfMassPositions[j].x;
                    var dy = moleculeCenterOfMassPositions[i].y - moleculeCenterOfMassPositions[j].y;
                    var distanceSquared = dx * dx + dy * dy;

                    if (distanceSquared < VerletAlgorithm.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD) {
                        // Calculate the Lennard-Jones interaction forces.
                        if (distanceSquared < VerletAlgorithm.MIN_DISTANCE_SQUARED)
                            distanceSquared = VerletAlgorithm.MIN_DISTANCE_SQUARED;

                        var r2inv = 1 / distanceSquared;
                        var r6inv = r2inv * r2inv * r2inv;

                        // A scaling factor is added here for the repulsive
                        //   portion of the Lennard-Jones force.  The idea is that
                        //   the force goes up at lower temperatures in order to
                        //   make the ice appear more spacious.  This is not real
                        //   physics, it is "hollywooding" in order to get the
                        //   crystalline behavior we need for ice.
                        var repulsiveForceScalingFactor;
                        if (temperatureSetPoint > VerletAlgorithm.WATER_FULLY_MELTED_TEMPERATURE) {
                            // No scaling of the repulsive force.
                            repulsiveForceScalingFactor = 1;
                        }
                        else if (temperatureSetPoint < VerletAlgorithm.WATER_FULLY_FROZEN_TEMPERATURE) {
                            // Scale by the max to force space in the crystal.
                            repulsiveForceScalingFactor = VerletAlgorithm.MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER;
                        }
                        else {
                            // We are somewhere between fully frozen and fully
                            // liquified, so adjust the scaling factor accordingly.
                            var temperatureFactor = (temperatureSetPoint - VerletAlgorithm.WATER_FULLY_FROZEN_TEMPERATURE) / (
                                VerletAlgorithm.WATER_FULLY_MELTED_TEMPERATURE - VerletAlgorithm.WATER_FULLY_FROZEN_TEMPERATURE
                            );

                            repulsiveForceScalingFactor = VerletAlgorithm.MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER - (
                                temperatureFactor * (VerletAlgorithm.MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER - 1)
                            );
                        }
                        var forceScalar = 48 * r2inv * r6inv * ((r6inv * repulsiveForceScalingFactor) - 0.5);
                        force.x = dx * forceScalar;
                        force.y = dy * forceScalar;
                        nextMoleculeForces[i].add(force);
                        nextMoleculeForces[j].sub(force);
                        this.potentialEnergy += 4 * r6inv * (r6inv - 1) + 0.016316891136;
                    }

                    if (distanceSquared < VerletAlgorithm.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD) {
                        // Calculate coulomb-like interactions between atoms on
                        // individual water molecules.
                        for (var ii = 0; ii < 3; ii++) {
                            for (var jj = 0; jj < 3; jj++) {
                                if (((3 * i + ii + 1) % 6 == 0) || ((3 * j + jj + 1) % 6 == 0)) {
                                    // This is a hydrogen atom that is not going to be included
                                    //   in the calculation in order to try to create a more
                                    //   crystalline solid.  This is part of the "hollywooding"
                                    //   that we do to create a better looking water crystal at
                                    //   low temperatures.
                                    continue;
                                }
                                dx = atomPositions[3 * i + ii].x - atomPositions[3 * j + jj].x;
                                dy = atomPositions[3 * i + ii].y - atomPositions[3 * j + jj].y;
                                var r2inv = 1 / (dx * dx + dy * dy);
                                var forceScalar = chargesA[ii] * chargesB[jj] * r2inv * r2inv;
                                force.x = dx * forceScalar;
                                force.y = dy * forceScalar;

                                nextMoleculeForces[i].add(force);
                                nextMoleculeForces[j].sub(force);
                                nextMoleculeTorques[i] += (atomPositions[3 * i + ii].x - moleculeCenterOfMassPositions[i].x) * force.y -
                                                          (atomPositions[3 * i + ii].y - moleculeCenterOfMassPositions[i].y) * force.x;
                                nextMoleculeTorques[j] -= (atomPositions[3 * j + jj].x - moleculeCenterOfMassPositions[j].x) * force.y -
                                                          (atomPositions[3 * j + jj].y - moleculeCenterOfMassPositions[j].y) * force.x;
                            }
                        }
                    }
                }
            }

            return this.potentialEnergy;
        },

        /**
         * Updates the velocities and rotation rates and calculate kinetic
         *   energy.
         */
        _calculateVelocitiesAndRotationRates: function(moleculeVelocities, moleculeRotationRates, numberOfMolecules, moleculeForces, nextMoleculeForces, moleculeMass, moleculeRotationalInertia, nextMoleculeTorques, massInverse, inertiaInverse) {
            var centersOfMassKineticEnergy = 0;
            var rotationalKineticEnergy = 0;

            for (var i = 0; i < numberOfMolecules; i++) {

                var xVel = moleculeVelocities[i].x + VerletAlgorithm.TIME_STEP_HALF * (moleculeForces[i].x + nextMoleculeForces[i].x) * massInverse;
                var yVel = moleculeVelocities[i].y + VerletAlgorithm.TIME_STEP_HALF * (moleculeForces[i].y + nextMoleculeForces[i].y) * massInverse;
                moleculeVelocities[i].set(xVel, yVel);

                moleculeRotationRates[i] += VerletAlgorithm.TIME_STEP_HALF * (moleculeTorques[i] + nextMoleculeTorques[i]) * inertiaInverse;

                centersOfMassKineticEnergy += 0.5 * moleculeMass * (
                    Math.pow(moleculeVelocities[i].x, 2) + Math.pow(moleculeVelocities[i].y, 2)
                );

                rotationalKineticEnergy += 0.5 * moleculeRotationalInertia * Math.pow(moleculeRotationRates[i], 2);

                // Move the newly calculated forces and torques into the current spots.
                moleculeForces[i].set(nextMoleculeForces[i].x, nextMoleculeForces[i].y);
                moleculeTorques[i] = nextMoleculeTorques[i];
            }

            // Record the calculated temperature.
            this.temperature = (centersOfMassKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
        }
        
    });

    /**
     * Static constants
     */
    _.extend(WaterVerletAlgorithm, Constants.WaterVerletAlgorithm);

    return WaterVerletAlgorithm;
});