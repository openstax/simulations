
define(function(require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var VerletAlgorithm = require('../verlet-algorithm');
    var DiatomicAtomPositionUpdater = require('models/atom-position-updater/diatomic');

    /**
     * Implementation of the Verlet algorithm for simulating molecular interaction
     *   based on the Lennard-Jones potential - diatomic (i.e. two atoms per
     *   molecule) version.
     */
    var DiatomicVerletAlgorithm = function(simulation) {
        VerletAlgorithm.apply(this, [simulation]);

        this.positionUpdater = DiatomicAtomPositionUpdater;
    };

    _.extend(DiatomicVerletAlgorithm.prototype, VerletAlgorithm.prototype, {

        /**
         * Update the motion of the particles and the forces that are acting upon
         *   them.  This is the heart of this class, and it is here that the actual
         *   Verlet algorithm is contained.
         */
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
                moleculeCenterOfMassPositions, 
                numberOfMolecules, 
                moleculeVelocities, 
                moleculeForces,
                moleculeTorques, 
                moleculeRotationRates, 
                moleculeRotationAngles,
                massInverse, 
                inertiaInverse
            );

            this.positionUpdater.updateAtomPositions(moleculeDataSet);

            // Calculate the force from the walls.  This force is assumed to act
            //   on the center of mass, so there is no torque.
            //   Calculate the forces exerted on the particles by the container
            //   walls and by gravity.
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
            //   check them to see if they can be moved into the "safe" category.
            if (moleculeDataSet.numberOfSafeMolecules < numberOfMolecules)
                this.updateMoleculeSafety();

            // Calculate the force and torque due to inter-particle interactions.
            this._calculateInteractionForces(
                nextMoleculeForces, 
                nextMoleculeTorques, 
                moleculeDataSet.numberOfSafeMolecules, 
                atomPositions, 
                moleculeCenterOfMassPositions
            );

            // Update center of mass velocities and angles and calculate kinetic
            //   energy.
            this._calculateVelocities(
                moleculeVelocities, 
                numberOfMolecules, 
                moleculeRotationRates,
                moleculeForces, 
                moleculeTorques, 
                nextMoleculeForces, 
                nextMoleculeTorques, 
                moleculeDataSet.moleculeMass, 
                moleculeDataSet.moleculeRotationalInertia, 
                massInverse, 
                inertiaInverse
            );
        },


        /**
         *  Updates the positions of all particles based on their current
         *    velocities and the forces acting on them.
         */
        _updateCenterOfMassPositions: function(moleculeCenterOfMassPositions, numberOfMolecules, moleculeVelocities, moleculeForces, moleculeTorques, moleculeRotationRates, moleculeRotationAngles, massInverse, inertiaInverse) {
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
         * Calculate the forces exerted on the particles by the container
         *   walls and by gravity.
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
                //   exerted on the walls of the container.
                if (nextMoleculeForces[i].y < 0) {
                    pressureZoneWallForce += -nextMoleculeForces[i].y;
                }
                else if (moleculeCenterOfMassPositions[i].y > normalizedContainerHeight / 2) {
                    // If the particle bounced on one of the walls above the midpoint, add
                    //   in that value to the pressure.
                    pressureZoneWallForce += Math.abs(nextMoleculeForces[i].x);
                }

                // Add in the effect of gravity.
                var _gravitationalAcceleration = gravitationalAcceleration;
                if (temperatureSetPoint < VerletAlgorithm.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES) {
                    // Below a certain temperature, gravity is increased to counteract some
                    //   odd-looking behaviorcaused by the thermostat.
                    _gravitationalAcceleration = gravitationalAcceleration * (
                        (VerletAlgorithm.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES - temperatureSetPoint) *
                        VerletAlgorithm.LOW_TEMPERATURE_GRAVITY_INCREASE_RATE + 1
                    );
                }
                nextMoleculeForces[i].y = nextMoleculeForces[i].y - _gravitationalAcceleration;
            }

            return pressureZoneWallForce;
        },

        /**
         * Calculate the forces created through interactions with other
         *   particles.
         */
        _calculateInteractionForces: function(nextMoleculeForces, nextMoleculeTorques, numberOfSafeMolecules, atomPositions, moleculeCenterOfMassPositions) {
            var force = new Vector2();
            for (var i = 0; i < numberOfSafeMolecules; i++) {
                for (var j = i + 1; j < numberOfSafeMolecules; j++) {
                    for (var ii = 0; ii < 2; ii++) {
                        for (var jj = 0; jj < 2; jj++) {
                            // Calculate the distance between the potentially
                            //   interacting atoms.
                            var dx = atomPositions[2 * i + ii].x - atomPositions[2 * j + jj].x;
                            var dy = atomPositions[2 * i + ii].y - atomPositions[2 * j + jj].y;
                            var distanceSquared = dx * dx + dy * dy;
                            if (distanceSquared < VerletAlgorithm.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD) {

                                if (distanceSquared < VerletAlgorithm.MIN_DISTANCE_SQUARED)
                                    distanceSquared = VerletAlgorithm.MIN_DISTANCE_SQUARED;

                                // Calculate the Lennard-Jones interaction forces.
                                var r2inv = 1 / distanceSquared;
                                var r6inv = r2inv * r2inv * r2inv;
                                var forceScalar = 48 * r2inv * r6inv * (r6inv - 0.5);
                                var fx = dx * forceScalar;
                                var fy = dy * forceScalar;
                                force.set(fx, fy);

                                nextMoleculeForces[i].add(force);
                                nextMoleculeForces[j].sub(force);
                                nextMoleculeTorques[i] +=
                                    (atomPositions[2 * i + ii].x - moleculeCenterOfMassPositions[i].x) * fy -
                                    (atomPositions[2 * i + ii].y - moleculeCenterOfMassPositions[i].y) * fx;
                                nextMoleculeTorques[j] -=
                                    (atomPositions[2 * j + jj].x - moleculeCenterOfMassPositions[j].x) * fy -
                                    (atomPositions[2 * j + jj].y - moleculeCenterOfMassPositions[j].y) * fx;

                                this.potentialEnergy += 4 * r6inv * (r6inv - 1) + 0.016316891136;
                            }
                        }
                    }
                }
            }

            return this.potentialEnergy;
        },

        /**
         * Calculate the new velocities based on the old ones and the forces
         *   that are acting on the particle.
         */
        _calculateVelocities: function(moleculeVelocities, numberOfMolecules, moleculeRotationRates, moleculeForces, moleculeTorques, nextMoleculeForces, nextMoleculeTorques, moleculeMass, moleculeRotationalInertia, massInverse, inertiaInverse) {
            var centersOfMassKineticEnergy = 0;
            var rotationalKineticEnergy = 0;

            for (var i = 0; i < numberOfMolecules; i++) {

                var xVel = moleculeVelocities[i].x + 
                    VerletAlgorithm.TIME_STEP_HALF * (moleculeForces[i].x + nextMoleculeForces[i].x) * massInverse;
                var yVel = moleculeVelocities[i].y +
                    VerletAlgorithm.TIME_STEP_HALF * (moleculeForces[i].y + nextMoleculeForces[i].y) * massInverse;
                moleculeVelocities[i].set(xVel, yVel);

                moleculeRotationRates[i] += VerletAlgorithm.TIME_STEP_HALF * (moleculeTorques[i] + nextMoleculeTorques[i]) * inertiaInverse;

                centersOfMassKineticEnergy += 0.5 * 
                    moleculeMass *
                    (Math.pow(moleculeVelocities[i].x, 2) + Math.pow(moleculeVelocities[i].y, 2));

                rotationalKineticEnergy += 0.5 * 
                    moleculeRotationalInertia *
                    Math.pow(moleculeRotationRates[i], 2);

                // Move the newly calculated forces and torques into the current spots.
                moleculeForces[i].set(nextMoleculeForces[i].x, nextMoleculeForces[i].y);
                moleculeTorques[i] = nextMoleculeTorques[i];
            }

            // Record the calculated temperature.
            this.temperature = (centersOfMassKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
        }

    });

    return DiatomicVerletAlgorithm;
});