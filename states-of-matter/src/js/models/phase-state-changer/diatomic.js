
define(function(require) {

    'use strict';

    var _ = require('underscore');
    var gaussRandom = require('gauss-random');

    var Vector2 = require('common/math/vector2');

    var PhaseStateChanger = require('../phase-state-changer');
    var DiatomicAtomPositionUpdater = require('models/atom-position-updater/diatomic');

    var Constants = require('constants');

    /**
     * Allows users to directly set the phase state (i.e. solid, liquid, or gas)
     */
    var DiatomicPhaseStateChanger = function(simulation) {
        PhaseStateChanger.apply(this, [simulation]);

        this.positionUpdater = DiatomicAtomPositionUpdater;
    };

    _.extend(DiatomicPhaseStateChanger.prototype, PhaseStateChanger.prototype, {

        /**
         * Sets to the specified phase.
         */
        setPhase: function(phase) {
            var postChangeModelSteps = 0;

            switch (phase) {
                case PhaseStateChanger.SOLID:
                    this.setPhaseSolid();
                    postChangeModelSteps = 0;
                    break;
                case PhaseStateChanger.LIQUID:
                    this.setPhaseLiquid();
                    postChangeModelSteps = 200;
                    break;
                case PhaseStateChanger.GAS:
                    this.setPhaseGas();
                    postChangeModelSteps = 0;
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
            for (var i = 0; i < postChangeModelSteps; i++)
                this.simulation.step();
        },

        /**
         * Set the phase to the solid state.
         */
        setPhaseSolid: function() {
            // Set the temperature in the model.
            this.simulation.set('temperatureSetPoint', Constants.SOMSimulation.SOLID_TEMPERATURE);

            // Get references to the various elements of the data set.
            var moleculeDataSet = this.simulation.moleculeDataSet;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeVelocities = moleculeDataSet.moleculeVelocities;
            var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;

            // Create and initialize other variables needed to do the job.
            var numberOfAtoms = moleculeDataSet.numberOfAtoms;
            var temperatureSqrt = Math.sqrt(this.simulation.get('temperatureSetPoint'));
            var atomsPerLayer = Math.round(Math.sqrt(numberOfAtoms));

            // Establish the starting position, which will be the lower left corner
            //   of the "cube".  The molecules will all be rotated so that they are
            //   lying down.
            var crystalWidth = moleculesPerLayer * (2.0 - 0.3); // Final term is a fudge factor that can be adjusted to center the cube.
            var startingPosX = (this.simulation.getNormalizedContainerWidth() / 2) - (crystalWidth / 2);
            var startingPosY = 1.2 + DiatomicPhaseStateChanger.DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL; // Multiplier can be tweaked to minimize initial "bounce".

            // Place the molecules by placing their centers of mass.
            var moleculesPlaced = 0;
            var xPos, yPos;
            for (var i = 0; i < numberOfMolecules; i++) { // One iteration per layer.
                for (var j = 0; (j < moleculesPerLayer) && (moleculesPlaced < numberOfMolecules); j++) {
                    xPos = startingPosX + (j * DiatomicPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE);
                    if (i % 2 != 0) {
                        // Every other row is shifted a bit to create hexagonal pattern.
                        xPos += (1 + DiatomicPhaseStateChanger.DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL) / 2;
                    }
                    yPos = startingPosY + (i * DiatomicPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE * 0.5);
                    moleculeCenterOfMassPositions[(i * moleculesPerLayer) + j].set(xPos, yPos);
                    moleculeRotationAngles[(i * moleculesPerLayer) + j] = 0;

                    moleculesPlaced++;

                    // Assign each molecule an initial velocity.
                    var xVel = temperatureSqrt * gaussRandom();
                    var yVel = temperatureSqrt * gaussRandom();
                    moleculeVelocities[(i * moleculesPerLayer) + j].set(xVel, yVel);
                }
            }
        },

        /**
         * Set the phase to the liquid state.
         */
        setPhaseLiquid: function() {
            // Set the model temperature for this phase.
            this.simulation.set('temperatureSetPoint', Constants.SOMSimulation.LIQUID_TEMPERATURE);

            // Get references to the various elements of the data set.
            var moleculeDataSet = this.simulation.moleculeDataSet;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeVelocities = moleculeDataSet.moleculeVelocities;
            var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
            var moleculeRotationRates = moleculeDataSet.moleculeRotationRates;

            // Create and initialize other variables needed to do the job.
            var numberOfAtoms = moleculeDataSet.numberOfAtoms;
            var temperatureSqrt = Math.sqrt(this.simulation.get('temperatureSetPoint'));

            // Initialize the velocities and angles of the molecules.
            for (var i = 0; i < numberOfMolecules; i++) {
                // Assign each molecule an initial velocity.
                moleculeVelocities[i].set( 
                    temperatureSqrt * gaussRandom(),
                    temperatureSqrt * gaussRandom()
                );

                // Assign each molecule an initial rotation rate.
                moleculeRotationRates[i] = Math.random() * temperatureSqrt * Math.PI * 2;
            }

            // Assign each molecule to a position.
            var moleculesPlaced = 0;

            var centerPoint = new Vector2( 
                this.simulation.getNormalizedContainerWidth() / 2,
                this.simulation.getNormalizedContainerHeight() / 4 
            );
            var currentLayer = 0;
            var particlesOnCurrentLayer = 0;
            var particlesThatWillFitOnCurrentLayer = 1;

            for (var i = 0; i < numberOfMolecules; i++ ) {
                for (var j = 0; j < MAX_PLACEMENT_ATTEMPTS; j++ ) {

                    var distanceFromCenter = currentLayer * DiatomicPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE * DiatomicPhaseStateChanger.LIQUID_SPACING_FACTOR;
                    var angle = (particlesOnCurrentLayer / particlesThatWillFitOnCurrentLayer * 2 * Math.PI) + (
                        particlesThatWillFitOnCurrentLayer / ( 4 * Math.PI )
                    );
                    var xPos = centerPoint.x + (distanceFromCenter * Math.cos(angle));
                    var yPos = centerPoint.y + (distanceFromCenter * Math.sin(angle));
                    particlesOnCurrentLayer++;  // Consider this spot used even if we don't actually put the
                                                //   particle there.
                    if (particlesOnCurrentLayer >= particlesThatWillFitOnCurrentLayer) {
                        // This layer is full - move to the next one.
                        currentLayer++;
                        particlesThatWillFitOnCurrentLayer = currentLayer * 2 * Math.PI / ( 
                            DiatomicPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE * DiatomicPhaseStateChanger.LIQUID_SPACING_FACTOR 
                        );
                        particlesOnCurrentLayer = 0;
                    }

                    // Check if the position is too close to the wall.  Note
                    // that we don't check inter-particle distances here - we rely
                    // on the placement algorithm to make sure that this is not a
                    // problem.
                    if ((xPos > DiatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
                        (xPos < this.simulation.getNormalizedContainerWidth() - DiatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
                        (yPos > DiatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
                        (xPos < this.simulation.getNormalizedContainerHeight() - DiatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE)) {

                        // This is an acceptable position.
                        moleculeCenterOfMassPositions[moleculesPlaced].set(xPos, yPos);
                        moleculeRotationAngles[moleculesPlaced] = angle + Math.PI / 2;
                        moleculesPlaced++;
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

            // Get references to the various elements of the data set.
            var moleculeDataSet = this.simulation.moleculeDataSet;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeVelocities = moleculeDataSet.moleculeVelocities;
            var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
            var moleculeRotationRates = moleculeDataSet.moleculeRotationRates;

            // Create and initialize other variables needed to do the job.
            var numberOfAtoms = moleculeDataSet.numberOfAtoms;
            var temperatureSqrt = Math.sqrt(this.simulation.get('temperatureSetPoint'));

            for (var i = 0; i < numberOfMolecules; i++) {
                // Temporarily position the molecules at (0,0).
                moleculeCenterOfMassPositions[i].set(0, 0);

                // Assign each molecule an initial velocity.
                moleculeVelocities[i].set( 
                    temperatureSqrt * rand.nextGaussian(),
                    temperatureSqrt * rand.nextGaussian() 
                );

                // Assign each molecule an initial rotational position.
                moleculeRotationAngles[i] = Math.random() * Math.PI * 2;

                // Assign each molecule an initial rotation rate.
                moleculeRotationRates[i] = Math.random() * temperatureSqrt * Math.PI * 2;
            }

            // Redistribute the molecules randomly around the container, but make
            //   sure that they are not too close together or they end up with a
            //   disproportionate amount of kinetic energy.
            var newPosX, newPosY;
            var rangeX = this.simulation.getNormalizedContainerWidth()  - (2 * DiatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
            var rangeY = this.simulation.getNormalizedContainerHeight() - (2 * DiatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
            for (var i = 0; i < numberOfMolecules; i++) {
                for (var j = 0; j < DiatomicPhaseStateChanger.MAX_PLACEMENT_ATTEMPTS; j++) {
                    // Pick a random position.
                    newPosX = DiatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (Math.random() * rangeX);
                    newPosY = DiatomicPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (Math.random() * rangeY);
                    var positionAvailable = true;
                    var distanceToNew = moleculeCenterOfMassPositions[k].distance(newPosX, newPosY);
                    // See if this position is available.
                    for (var k = 0; k < i; k++) {
                        if (distanceToNew < DiatomicPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE * DiatomicPhaseStateChanger.GAS_SPACING_FACTOR) {
                            positionAvailable = false;
                            break;
                        }
                    }
                    if (positionAvailable) {
                        // We found an open position.
                        moleculeCenterOfMassPositions[i].set(newPosX, newPosY);
                        break;
                    }
                    else if (j === DiatomicPhaseStateChanger.MAX_PLACEMENT_ATTEMPTS - 1) {
                        // This is the last attempt, so use this position anyway.
                        var openPoint = this.findOpenMoleculeLocation();
                        if (openPoint !== null)
                            moleculeCenterOfMassPositions[i].set(openPoint);
                    }
                }
            }
        }

    });

    /**
     * Static constants
     */
    _.extend(DiatomicPhaseStateChanger, Constants.DiatomicPhaseStateChanger);

    return DiatomicPhaseStateChanger;
});