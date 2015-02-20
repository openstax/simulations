define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Constants = require('constants');

    /**
     * This is a base class for classes that implement the Verlet algorithm 
     *   for simulating molecular interactions based on the Lennard-Jones 
     *   potential.
     */
    var VerletAlgorithm = function(simulation) {
        this.simulation = simulation;
        this.potentialEnergy = 0;
        this.pressure = 0;
        this.temperature = 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(VerletAlgorithm.prototype, {

        getPressure: function() {
            return this.pressure;
        },

        getTemperature: function() {
            return this.temperature;
        },

        /**
         * Calculate the force exerted on a particle at the provided position by
         *   the walls of the container.  The result is returned in the provided
         *   vector.
         *
         * @param position        - Current position of the particle.
         * @param containerWidth  - Width of the container where particles are held.
         * @param containerHeight - Height of the container where particles are held.
         * @param resultantForce  - Vector in which the resulting force is returned.
         */
        calculateWallForce: function(position, containerWidth, containerHeight, resultantForce) {
            if ((resultantForce === null) || (position === null))
                return;

            var simulation = this.simulation;

            var xPos = position.x;
            var yPos = position.y;

            var minDistance = VerletAlgorithm.WALL_DISTANCE_THRESHOLD * 0.8;
            var distance;

            if (yPos < simulation.getNormalizedContainerWidth()) {
                // Calculate the force in the X direction.
                if (xPos < VerletAlgorithm.WALL_DISTANCE_THRESHOLD) {
                    // Close enough to the left wall to feel the force.
                    if (xPos < minDistance) {
                        if ((xPos < 0) && (simulation.get('exploded'))) {
                            // The particle is outside the container after the
                            // container has exploded, so don't let the walls
                            // exert any force.
                            xPos = Number.POSITIVE_INFINITY;
                        }
                        else {
                            // Limit the distance, and thus the force, if we are really close.
                            xPos = minDistance;
                        }
                    }
                    resultantForce.x = (48 / (Math.pow(xPos, 13))) - (24 / (Math.pow(xPos, 7)));
                    this.potentialEnergy += 4 / (Math.pow(xPos, 12)) - 4 / (Math.pow(xPos, 6)) + 1;
                }
                else if (containerWidth - xPos < VerletAlgorithm.WALL_DISTANCE_THRESHOLD) {
                    // Close enough to the right wall to feel the force.
                    distance = containerWidth - xPos;
                    if (distance < minDistance) {
                        if ((distance < 0) && (simulation.get('exploded'))) {
                            // The particle is outside the container after the
                            // container has exploded, so don't let the walls
                            // exert any force.
                            xPos = Number.POSITIVE_INFINITY;
                        }
                        else {
                            distance = minDistance;
                        }
                    }
                    resultantForce.x = -(48 / (Math.pow(distance, 13))) +
                                        (24 / (Math.pow(distance, 7)));
                    this.potentialEnergy += 4 / (Math.pow(distance, 12)) -
                                            4 / (Math.pow(distance, 6)) + 1;
                }
            }

            // Calculate the force in the Y direction.
            if (yPos < VerletAlgorithm.WALL_DISTANCE_THRESHOLD) {
                // Close enough to the bottom wall to feel the force.
                if (yPos < minDistance) {
                    if ((yPos < 0) && (!simulation.get('exploded'))) {
                        // The particles are energetic enough to end up outside
                        // the container, so consider it to be exploded (if it
                        // isn't already).
                        simulation.explode();
                    }
                    yPos = minDistance;
                }
                if (!simulation.get('exploded') || ((xPos > 0) && (xPos < containerWidth))) {
                    // Only calculate the force if the particle is inside the
                    // container.
                    resultantForce.y = 48 / (Math.pow(yPos, 13)) - (24 / (Math.pow(yPos, 7)));
                    this.potentialEnergy += 4 / (Math.pow(yPos, 12)) - 4 / (Math.pow(yPos, 6)) + 1;
                }
            }
            else if ((containerHeight - yPos < VerletAlgorithm.WALL_DISTANCE_THRESHOLD) && !simulation.get('exploded')) {
                // Close enough to the top to feel the force.
                distance = containerHeight - yPos;
                if (distance < minDistance)
                    distance = minDistance;

                resultantForce.y = -48 / (Math.pow(distance, 13)) + (24 / (Math.pow(distance, 7)));
                this.potentialEnergy += 4 / (Math.pow(distance, 12)) - 4 / (Math.pow(distance, 6)) + 1;
            }
        },

        /**
         * Update the safety status of any molecules that may have previously been
         *   designated as unsafe.  An "unsafe" molecule is one that was injected
         *   into the container and was found to be so close to one or more of the
         *   other molecules that if its interaction forces were calculated, it
         *   would be given a ridiculously large amount of kinetic energy that
         *   could end up launching it out of the container.
         */
        updateMoleculeSafety: function() {

            var moleculeDataSet = this.simulation.moleculeDataSet;
            var numberOfSafeMolecules = moleculeDataSet.numberOfSafeMolecules;
            var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

            if (numberOfMolecules == numberOfSafeMolecules) {
                // Nothing to do, so quit now.
                return;
            }

            var moleculeDataSet               = this.simulation.moleculeDataSet;
            var atomsPerMolecule              = moleculeDataSet.atomsPerMolecule;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeVelocities            = moleculeDataSet.moleculeVelocities;
            var moleculeForces                = moleculeDataSet.moleculeForces;
            var moleculeRotationAngles        = moleculeDataSet.moleculeRotationAngles;
            var moleculeRotationRates         = moleculeDataSet.moleculeRotationRates;

            for (var i = numberOfSafeMolecules; i < numberOfMolecules; i++) {

                var moleculeIsUnsafe = false;

                // Find out if this molecule is still too close to all the "safe"
                //   molecules to become safe itself.
                for (var j = 0; j < numberOfSafeMolecules; j++) {
                    if (moleculeCenterOfMassPositions[i].distance(moleculeCenterOfMassPositions[j]) < VerletAlgorithm.SAFE_INTER_MOLECULE_DISTANCE) {
                        moleculeIsUnsafe = true;
                        break;
                    }
                }

                if (!moleculeIsUnsafe) {
                    // The molecule just tested was safe, so adjust the arrays
                    // accordingly.
                    if (i !== numberOfSafeMolecules) {
                        // There is at least one unsafe atom/molecule in front of
                        //   this one in the arrays, so some swapping must be done
                        //   before the number of safe atoms can be incremented.

                        // Swap the atoms that comprise the safe molecules with the
                        //   first unsafe one.
                        var tempAtomPosition;
                        for (var j = 0; j < atomsPerMolecule; j++) {
                            tempAtomPosition = atomPositions[(numberOfSafeMolecules * atomsPerMolecule) + j];
                            atomPositions[(numberOfSafeMolecules * atomsPerMolecule) + j] = atomPositions[(atomsPerMolecule * i) + j];
                            atomPositions[(atomsPerMolecule * i) + j] = tempAtomPosition;
                        }

                        var firstUnsafeMoleculeIndex = numberOfSafeMolecules;

                        var tempMoleculeCenterOfMassPosition;
                        tempMoleculeCenterOfMassPosition = moleculeCenterOfMassPositions[firstUnsafeMoleculeIndex];
                        moleculeCenterOfMassPositions[firstUnsafeMoleculeIndex] = moleculeCenterOfMassPositions[i];
                        moleculeCenterOfMassPositions[i] = tempMoleculeCenterOfMassPosition;

                        var tempMoleculeVelocity;
                        tempMoleculeVelocity = moleculeVelocities[firstUnsafeMoleculeIndex];
                        moleculeVelocities[firstUnsafeMoleculeIndex] = moleculeVelocities[i];
                        moleculeVelocities[i] = tempMoleculeVelocity;

                        var tempMoleculeForce;
                        tempMoleculeForce = moleculeForces[firstUnsafeMoleculeIndex];
                        moleculeForces[firstUnsafeMoleculeIndex] = moleculeForces[i];
                        moleculeForces[i] = tempMoleculeForce;

                        var tempMoleculeRotationAngle;
                        tempMoleculeRotationAngle = moleculeRotationAngles[firstUnsafeMoleculeIndex];
                        moleculeRotationAngles[firstUnsafeMoleculeIndex] = moleculeRotationAngles[i];
                        moleculeRotationAngles[i] = tempMoleculeRotationAngle;

                        var tempMoleculeRotationRate;
                        tempMoleculeRotationRate = moleculeRotationRates[firstUnsafeMoleculeIndex];
                        moleculeRotationRates[firstUnsafeMoleculeIndex] = moleculeRotationRates[i];
                        moleculeRotationRates[i] = tempMoleculeRotationRate;

                        // Note: Don't worry about torque, since there isn't any until the molecules become "safe".
                    }
                    numberOfSafeMolecules++;
                    moleculeDataSet.numberOfSafeMolecules = numberOfSafeMolecules;
                }
            }
        },

        updatePressure: function(pressureZoneWallForce) {
            if (this.simulation.get('exploded')) {
                // If the container has exploded, there is essentially no pressure.
                this.pressure = 0;
            }
            else {
                this.pressure = (1 - VerletAlgorithm.PRESSURE_CALC_WEIGHTING) *
                    (pressureZoneWallForce / (this.simulation.getNormalizedContainerWidth() + this.simulation.getNormalizedContainerHeight())) +
                    VerletAlgorithm.PRESSURE_CALC_WEIGHTING * this.pressure;

                if ((this.pressure > VerletAlgorithm.EXPLOSION_PRESSURE) && !this.simulation.get('exploded')) {
                    // The pressure has reached the point where the container should
                    //   explode, so blow 'er up.
                    this.simulation.explode();
                }
            }
        },

        setScaledEpsilon: function(scaledEpsilon) {
            // In the base class this just issues a warning and has no effect.
            console.error('Warning: Setting epsilon is not implemented for this class, request ignored.');
        },

        getScaledEpsilon: function() {
            // In the base class this just issues a warning and returns 0.
            console.error('Warning: Getting scaled epsilon is not implemented for this class, returning zero.');
            return 0;
        }

    });

    /**
     * Static constants
     */
    _.extend(VerletAlgorithm, Constants.VerletAlgorithm);


    return VerletAlgorithm;
});
