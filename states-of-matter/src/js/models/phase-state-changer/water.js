
define(function(require) {

    'use strict';

    var _ = require('underscore');
    var gaussRandom = require('gauss-random');

    var Vector2 = require('common/math/vector2');

    var PhaseStateChanger = require('../phase-state-changer');
    var WaterAtomPositionUpdater = require('models/atom-position-updater/water');

    var Constants = require('constants');

    /**
     * Allows users to directly set the phase state (i.e. solid, liquid, or gas)
     */
    var WaterPhaseStateChanger = function(simulation) {
        PhaseStateChanger.apply(this, [simulation]);

        this.positionUpdater = WaterAtomPositionUpdater;
    };

    _.extend(WaterPhaseStateChanger.prototype, PhaseStateChanger.prototype, {

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
            for (var i = 0; i < 100; i++)
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
            var moleculeRotationRates = moleculeDataSet.moleculeRotationRates;

            // Create and initialize other variables needed to do the job.
            var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
            var temperatureSqrt = Math.sqrt(this.simulation.get('temperatureSetPoint'));
            var moleculesPerLayer = Math.floor(Math.sqrt(numberOfMolecules));

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

            // Establish the starting position, which will be the lower left corner
            //   of the "cube".
            var crystalWidth = (moleculesPerLayer - 1) * WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE;
            var startingPosX = (this.simulation.getNormalizedContainerWidth() / 2) - (crystalWidth / 2);
            var startingPosY = WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE;

            // Place the molecules by placing their centers of mass.
            var moleculesPlaced = 0;
            var xPos, yPos;
            for (var i = 0; i < numberOfMolecules; i++ ) { // One iteration per layer.
                for (var j = 0; (j < moleculesPerLayer) && (moleculesPlaced < numberOfMolecules); j++) {
                    xPos = startingPosX + (j * WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE);
                    if (i % 2 !== 0) {
                        // Every other row is shifted a bit to create hexagonal pattern.
                        xPos += WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE / 2;
                    }
                    yPos = startingPosY + (i * WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE * 0.866);

                    moleculeCenterOfMassPositions[(i * moleculesPerLayer) + j].set(xPos, yPos);
                    moleculeRotationAngles[(i * moleculesPerLayer) + j] = Math.random() * 2 * Math.PI;

                    moleculesPlaced++;
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
            var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
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
                    var distanceFromCenter = currentLayer * 
                        WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE * 
                        WaterPhaseStateChanger.LIQUID_SPACING_FACTOR;
                    var angle = (particlesOnCurrentLayer / particlesThatWillFitOnCurrentLayer * 2 * Math.PI) + (
                        particlesThatWillFitOnCurrentLayer / (4 * Math.PI)
                    );
                    var xPos = centerPoint.x + (distanceFromCenter * Math.cos(angle));
                    var yPos = centerPoint.y + (distanceFromCenter * Math.sin(angle));
                    particlesOnCurrentLayer++;  // Consider this spot used even if we don't actually put the
                                                //   particle there.
                    if (particlesOnCurrentLayer >= particlesThatWillFitOnCurrentLayer) {

                        // This layer is full - move to the next one.
                        currentLayer++;
                        particlesThatWillFitOnCurrentLayer = Math.floor(
                            currentLayer * 2 * Math.PI / (
                                WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE * 
                                WaterPhaseStateChanger.LIQUID_SPACING_FACTOR
                            ) 
                        );
                        particlesOnCurrentLayer = 0;
                    }

                    // Check if the position is too close to the wall.  Note
                    //   that we don't check inter-particle distances here - we rely
                    //   on the placement algorithm to make sure that this is not a
                    //   problem.
                    if ((xPos > WaterPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
                        (xPos < this.simulation.getNormalizedContainerWidth() - WaterPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
                        (yPos > WaterPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
                        (xPos < this.simulation.getNormalizedContainerHeight() - WaterPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE)) {

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
            var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
            var temperatureSqrt = Math.sqrt(this.simulation.get('temperatureSetPoint'));

            for (var i = 0; i < numberOfMolecules; i++) {
                // Temporarily position the molecules at (0,0).
                moleculeCenterOfMassPositions[i].set(0, 0);

                // Assign each molecule an initial velocity.
                moleculeVelocities[i].set( 
                    temperatureSqrt * gaussRandom(),
                    temperatureSqrt * gaussRandom()
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
            var rangeX = this.simulation.getNormalizedContainerWidth()  - (2 * WaterPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
            var rangeY = this.simulation.getNormalizedContainerHeight() - (2 * WaterPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
            for (var i = 0; i < numberOfMolecules; i++) {
                for (var j = 0; j < WaterPhaseStateChanger.MAX_PLACEMENT_ATTEMPTS; j++) {
                    // Pick a random position.
                    newPosX = WaterPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (Math.random() * rangeX);
                    newPosY = WaterPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (Math.random() * rangeY);
                    var distanceToNew = moleculeCenterOfMassPositions[k].distance(newPosX, newPosY);
                    var positionAvailable = true;
                    // See if this position is available.
                    for (var k = 0; k < i; k++) {
                        if (distanceToNew < WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE * WaterPhaseStateChanger.GAS_SPACING_FACTOR) {
                            positionAvailable = false;
                            break;
                        }
                    }
                    if (positionAvailable) {
                        // We found an open position.
                        moleculeCenterOfMassPositions[i].set(newPosX, newPosY);
                        break;
                    }
                    else if (j === WaterPhaseStateChanger.MAX_PLACEMENT_ATTEMPTS - 1) {
                        // This is the last attempt, so do a linear search for a
                        //   usable spot.
                        var openPoint = this.findOpenMoleculeLocation();
                        if (openPoint !== null) {
                            moleculeCenterOfMassPositions[i].set(openPoint);
                        }
                    }
                }
            }
        }

    });

    /**
     * Static constants
     */
    _.extend(WaterPhaseStateChanger, Constants.WaterPhaseStateChanger);

    return WaterPhaseStateChanger;
});