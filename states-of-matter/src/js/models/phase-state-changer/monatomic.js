
define(function(require) {

    'use strict';

    var _ = require('underscore');
    var gaussRandom = require('gauss-random');

    var Vector2 = require('common/math/vector2');

    var PhaseStateChanger = require('../phase-state-changer');
    var MonatomicAtomPositionUpdater = require('models/atom-position-updater/monatomic');

    var Constants = require('constants');

    /**
     * Allows users to directly set the phase state (i.e. solid, liquid, or gas)
     */
    var MonatomicPhaseStateChanger = function(simulation) {
        PhaseStateChanger.apply(this, [simulation]);

        this.positionUpdater = MonatomicAtomPositionUpdater;
    };

    _.extend(MonatomicPhaseStateChanger.prototype, PhaseStateChanger.prototype, {

        /**
         * Sets to the specified phase.
         */
        setPhase: function(phase) {
            switch (phase) {
                case PhaseStateChanger.SOLID:
                    this.setPhaseSolid();
                    break;
                case PhaseStateChanger.LIQUID:
                    this.setPhaseLiquid();
                    break;
                case PhaseStateChanger.GAS:
                    this.setPhaseGas();
                    break;
            }

            var moleculeDataSet = this.simulation.moleculeDataSet;

            // Assume that we've done our job correctly and that all the atoms are
            //   in safe positions.
            moleculeDataSet.numberOfSafeMolecules = moleculeDataSet.getNumberOfMolecules();

            // Sync up the atom positions with the molecule positions.
            this.positionUpdater.updateAtomPositions(moleculeDataSet);

            // Step the model a number of times in order to prevent the particles
            //   from looking too organized.  The number of steps was empirically
            //   determined.
            for (var i = 0; i < 20; i++)
                this.simulation.step();
        },

        /**
         * Set the phase to the solid state.
         */
        setPhaseSolid: function() {
            // Set the temperature in the model.
            this.simulation.set('temperatureSetPoint', Constants.SOMSimulation.SOLID_TEMPERATURE);

            // Create the solid form, a.k.a. a crystal.

            var numberOfAtoms = this.simulation.moleculeDataSet.numberOfAtoms;
            var moleculeCenterOfMassPositions = this.simulation.moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeVelocities = this.simulation.moleculeDataSet.moleculeVelocities;
            var temperatureSqrt = Math.sqrt(this.simulation.get('temperatureSetPoint'));
            var atomsPerLayer = Math.round(Math.sqrt(numberOfAtoms));

            // Establish the starting position, which will be the lower left corner
            //   of the "cube".
            var crystalWidth = (atomsPerLayer - 1) * MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE;

            var startingPosX = (this.simulation.getNormalizedContainerWidth() / 2) - (crystalWidth / 2);
            var startingPosY = MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE;


            var particlesPlaced = 0;
            var xPos, yPos;
            for (var i = 0; particlesPlaced < numberOfAtoms; i++) { // One iteration per layer.
                for (var j = 0; (j < atomsPerLayer) && (particlesPlaced < numberOfAtoms); j++) {
                    xPos = startingPosX + (j * MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE);
                    if (i % 2 !== 0) {
                        // Every other row is shifted a bit to create hexagonal pattern.
                        xPos += MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE / 2;
                    }
                    yPos = startingPosY + i * MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE * 0.866;
                    moleculeCenterOfMassPositions[(i * atomsPerLayer) + j].set(xPos, yPos);
                    particlesPlaced++;

                    // Assign each particle an initial velocity.
                    moleculeVelocities[(i * atomsPerLayer) + j].set(
                        temperatureSqrt * gaussRandom(),
                        temperatureSqrt * gaussRandom()
                    );
                }
            }
        },

        /**
         * Set the phase to the liquid state.
         */
        setPhaseLiquid: function() {
            this.simulation.set('temperatureSetPoint', Constants.SOMSimulation.LIQUID_TEMPERATURE);
            var temperatureSqrt = Math.sqrt(Constants.SOMSimulation.LIQUID_TEMPERATURE);

            // Set the initial velocity for each of the atoms based on the new
            //   temperature.
            var numberOfAtoms = this.simulation.moleculeDataSet.numberOfAtoms;
            var moleculeCenterOfMassPositions = this.simulation.moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeVelocities = this.simulation.moleculeDataSet.moleculeVelocities;
            for (var i = 0; i < numberOfAtoms; i++) {
                // Assign each particle an initial velocity.
                moleculeVelocities[i].set(
                    temperatureSqrt * gaussRandom(),
                    temperatureSqrt * gaussRandom()
                );
            }

            // Assign each atom to a position centered on its blob.
            var atomsPlaced = 0;

            var centerPoint = new Vector2(
                this.simulation.getNormalizedContainerWidth() / 2,
                this.simulation.getNormalizedContainerHeight() / 4 
            );
            var currentLayer = 0;
            var particlesOnCurrentLayer = 0;
            var particlesThatWillFitOnCurrentLayer = 1;

            for (var j = 0; j < numberOfAtoms; j++) {
                for (var k = 0; k < MAX_PLACEMENT_ATTEMPTS; k++) {

                    var distanceFromCenter = currentLayer * MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE;
                    var angle = (particlesOnCurrentLayer / particlesThatWillFitOnCurrentLayer * 2 * Math.PI) + (
                        particlesThatWillFitOnCurrentLayer / (4 * Math.PI)
                    );
                    var xPos = centerPoint.x + (distanceFromCenter * Math.cos(angle));
                    var yPos = centerPoint.y + (distanceFromCenter * Math.sin(angle));
                    particlesOnCurrentLayer++;  // Consider this spot used even if we don't actually put the
                    // particle there.
                    if (particlesOnCurrentLayer >= particlesThatWillFitOnCurrentLayer) {

                        // This layer is full - move to the next one.
                        currentLayer++;
                        particlesThatWillFitOnCurrentLayer = Math.floor(
                            currentLayer * 2 * Math.PI / MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE
                        );
                        particlesOnCurrentLayer = 0;
                    }

                    // Check if the position is too close to the wall.  Note
                    //   that we don't check inter-particle distances here - we
                    //   rely on the placement algorithm to make sure that we don't
                    //   run into problems with this.
                    if ((xPos > MonatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
                        (xPos < this.simulation.getNormalizedContainerWidth() - MonatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
                        (yPos > MonatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
                        (xPos < this.simulation.getNormalizedContainerHeight() - MonatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE)) {

                        // This is an acceptable position.
                        moleculeCenterOfMassPositions[atomsPlaced++].set(xPos, yPos);
                        break;
                    }
                }
            }
        },

        /**
         * Set the phase to the gaseous state.
         */
        setPhaseGas: function() {

            // Set the temperature for the new state.
            this.simulation.set('temperatureSetPoint', Constants.SOMSimulation.GAS_TEMPERATURE);
            var temperatureSqrt = Math.sqrt(Constants.SOMSimulation.GAS_TEMPERATURE);

            var numberOfAtoms = this.simulation.moleculeDataSet.numberOfAtoms;
            var moleculeCenterOfMassPositions = this.simulation.moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeVelocities = this.simulation.moleculeDataSet.moleculeVelocities;
            for (var k = 0; k < numberOfAtoms; k++) {
                // Temporarily position the particles at (0,0).
                moleculeCenterOfMassPositions[k].set(0, 0);
                // Assign each particle an initial velocity.
                moleculeVelocities[k].set(
                    temperatureSqrt * gaussRandom(),
                    temperatureSqrt * gaussRandom()
                );
            }

            // Redistribute the particles randomly around the container, but make
            // sure that they are not too close together or they end up with a
            // disproportionate amount of kinetic energy.
            var newPosX, newPosY;
            var rangeX = this.simulation.getNormalizedContainerWidth()  - (2 * MonatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
            var rangeY = this.simulation.getNormalizedContainerHeight() - (2 * MonatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
            for (var i = 0; i < numberOfAtoms; i++) {
                for (var j = 0; j < PhaseStateChanger.MAX_PLACEMENT_ATTEMPTS; j++) {
                    // Pick a random position.
                    newPosX = MonatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (Math.random() * rangeX);
                    newPosY = MonatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (Math.random() * rangeY);
                    var positionAvailable = true;
                    // See if this position is available.
                    for (var k = 0; k < i; k++) {
                        if (moleculeCenterOfMassPositions[k].distance(newPosX, newPosY) < MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE) {
                            positionAvailable = false;
                            break;
                        }
                    }
                    if (positionAvailable) {
                        // We found an open position.
                        moleculeCenterOfMassPositions[i].set(newPosX, newPosY);
                        break;
                    }
                    else if (j === PhaseStateChanger.MAX_PLACEMENT_ATTEMPTS - 1) {
                        // This is the last attempt, so use this position anyway.
                        moleculeCenterOfMassPositions[i].set(newPosX, newPosY);
                    }
                }
            }
        }

    });

    /**
     * Static constants
     */
    _.extend(MonatomicPhaseStateChanger, Constants.PhaseStateChanger, Constants.MonatomicPhaseStateChanger);

    return MonatomicPhaseStateChanger;
});