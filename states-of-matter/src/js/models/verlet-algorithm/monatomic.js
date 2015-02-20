
define(function(require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var VerletAlgorithm = require('../verlet-algorithm');
    var MonatomicAtomPositionUpdater = require('models/atom-position-updater/monatomic');

    var Constants = require('constants');

    /**
     * Implementation of the Verlet algorithm for simulating molecular interaction
     *   based on the Lennard-Jones potential - monatomic (i.e. one atom per
     *   molecule) version.
     */
    var MonatomicVerletAlgorithm = function(simulation) {
        VerletAlgorithm.apply(this, [simulation]);

        this.positionUpdater = MonatomicAtomPositionUpdater;
        this.epsilon = 1; // Controls the strength of particle interaction.
    };

    _.extend(MonatomicVerletAlgorithm.prototype, VerletAlgorithm.prototype, {

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
            var numberOfAtoms                 = moleculeDataSet.numberOfAtoms;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeVelocities            = moleculeDataSet.moleculeVelocities;
            var moleculeForces                = moleculeDataSet.moleculeForces;
            var nextMoleculeForces            = moleculeDataSet.nextMoleculeForces;

            // Update the positions of all particles based on their current
            //   velocities and the forces acting on them.
            this.updateCenterOfMassPositions(
                moleculeCenterOfMassPositions, 
                numberOfAtoms, 
                moleculeVelocities, 
                moleculeForces
            );

            // Calculate the forces exerted on the particles by the container
            //   walls and by gravity.
            var pressureZoneWallForce = this.calculateWallAndGravityForces(
                nextMoleculeForces, 
                numberOfAtoms, 
                moleculeCenterOfMassPositions,
                simulation.getNormalizedContainerWidth(), 
                simulation.getNormalizedContainerHeight(), 
                simulation.getGravitationalAcceleration()
            );

            // Update the pressure calculation.
            this.updatePressure(pressureZoneWallForce);

            // If there are any atoms that are currently designated as "unsafe",
            //   check them to see if they can be moved into the "safe" category.
            if (moleculeDataSet.numberOfSafeMolecules < numberOfAtoms)
                this.updateMoleculeSafety();

            var numberOfSafeMolecules = moleculeDataSet.numberOfSafeMolecules;

            // Calculate the forces created through interactions with other
            //   particles.
            var potentialEnergy = this.calculateInteractionForces(
                nextMoleculeForces, 
                numberOfSafeMolecules, 
                moleculeCenterOfMassPositions
            );

            // Calculate the new velocities based on the old ones and the forces
            //   that are acting on the particle.
            var kineticEnergy = this.calculateVelocities(
                moleculeVelocities, 
                numberOfAtoms, 
                moleculeForces, 
                nextMoleculeForces
            );

            // Record the calculated temperature.
            this.temperature = kineticEnergy / numberOfAtoms;

            // Synchronize the molecule and atom positions.
            this.positionUpdater.updateAtomPositions(moleculeDataSet);

            // Replace the new forces with the old ones.
            for (var i = 0; i < numberOfAtoms; i++)
                moleculeForces[i].set(nextMoleculeForces[i].x, nextMoleculeForces[i].y);
        },

        updateCenterOfMassPositions: function(moleculeCenterOfMassPositions, numberOfAtoms, moleculeVelocities, moleculeForces) {
            for (var i = 0; i < numberOfAtoms; i++) {
                var xPos = moleculeCenterOfMassPositions[i].x + 
                    (VerletAlgorithm.TIME_STEP * moleculeVelocities[i].x) +
                    (VerletAlgorithm.TIME_STEP_SQR_HALF * moleculeForces[i].x);

                var yPos = moleculeCenterOfMassPositions[i].y + 
                    (VerletAlgorithm.TIME_STEP * moleculeVelocities[i].y) +
                    (VerletAlgorithm.TIME_STEP_SQR_HALF * moleculeForces[i].y);

                moleculeCenterOfMassPositions[i].set(xPos, yPos);
            }
        },

        calculateWallAndGravityForces: function(nextMoleculeForces, numberOfAtoms, moleculeCenterOfMassPositions, containerWidth, containerHeight, gravitationalAcceleration) {
            var pressureZoneWallForce = 0;

            for (var i = 0; i < numberOfAtoms; i++) {

                // Clear the previous calculation's particle forces.
                nextMoleculeForces[i].set(0, 0);

                // Get the force values caused by the container walls.
                this.calculateWallForce(
                    moleculeCenterOfMassPositions[i], 
                    containerWidth,
                    containerHeight,
                    nextMoleculeForces[i]
                );

                // Accumulate this force value as part of the pressure being
                // exerted on the walls of the container.
                if (nextMoleculeForces[i].y < 0) {
                    pressureZoneWallForce += -nextMoleculeForces[i].y;
                }
                else if (moleculeCenterOfMassPositions[i].y > containerHeight / 2) {
                    // If the particle bounced on one of the walls above the midpoint, add
                    // in that value to the pressure.
                    pressureZoneWallForce += Math.abs(nextMoleculeForces[i].x);
                }

                nextMoleculeForces[i].y = nextMoleculeForces[i].y - gravitationalAcceleration;
            }

            return pressureZoneWallForce;
        },

        calculateInteractionForces: function(nextMoleculeForces, numberOfSafeMolecules, moleculeCenterOfMassPositions) {
            var potentialEnergy = 0;

            var force = new Vector2();
            for (var i = 0; i < numberOfSafeMolecules; i++) {
                for (var j = i + 1; j < numberOfSafeMolecules; j++) {

                    var dx = moleculeCenterOfMassPositions[i].x - moleculeCenterOfMassPositions[j].x;
                    var dy = moleculeCenterOfMassPositions[i].y - moleculeCenterOfMassPositions[j].y;
                    var distanceSqrd = (dx * dx) + (dy * dy);

                    if (distanceSqrd == 0) {
                        // Handle the special case where the particles are right
                        // on top of each other by assigning an arbitrary spacing.
                        // In general, this only happens when injecting new
                        // particles.
                        dx = 1;
                        dy = 1;
                        distanceSqrd = 2;
                    }

                    if (distanceSqrd < VerletAlgorithm.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD) {
                        // This pair of particles is close enough to one another
                        // that we need to calculate their interaction forces.
                        if (distanceSqrd < VerletAlgorithm.MIN_DISTANCE_SQUARED) {
                            distanceSqrd = VerletAlgorithm.MIN_DISTANCE_SQUARED;
                        }
                        var r2inv = 1 / distanceSqrd;
                        var r6inv = r2inv * r2inv * r2inv;
                        var forceScalar = 48 * r2inv * r6inv * (r6inv - 0.5) * m_epsilon;
                        force.x = dx * forceScalar;
                        force.y = dy * forceScalar;
                        nextMoleculeForces[i].add(force);
                        nextMoleculeForces[j].sub(force);
                        potentialEnergy += 4 * r6inv * (r6inv - 1) + 0.016316891136;
                    }
                }
            }

            return potentialEnergy;
        },

        calculateVelocities: function(moleculeVelocities, numberOfAtoms, moleculeForces, nextMoleculeForces) {
            var kineticEnergy = 0;

            var velocityIncrement = new Vector2();
            for (var i = 0; i < numberOfAtoms; i++) {
                velocityIncrement.x = VerletAlgorithm.TIME_STEP_HALF * (moleculeForces[i].x + nextMoleculeForces[i].x);
                velocityIncrement.y = VerletAlgorithm.TIME_STEP_HALF * (moleculeForces[i].y + nextMoleculeForces[i].y);
                moleculeVelocities[i].add(velocityIncrement);
                kineticEnergy += (
                    (moleculeVelocities[i].x * moleculeVelocities[i].x) +
                    (moleculeVelocities[i].y * moleculeVelocities[i].y)
                ) / 2;
            }

            return kineticEnergy;
        }

    });

    return MonatomicVerletAlgorithm;
});