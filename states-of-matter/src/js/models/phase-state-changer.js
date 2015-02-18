define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Constants = require('constants');

    /**
     * Allows users to directly set the phase state (i.e. solid, liquid, or gas)
     */
    var PhaseStateChanger = function(simulation) {
        this.simulation = simulation;
    };

    /**
     * Instance functions/properties
     */
    _.extend(PhaseStateChanger.prototype, {

        setPhase: function(phase) {},

        /**
         * Does a linear search for a location that is suitably far away enough
         *   from all other molecules.  This is generally used when the attempt to
         *   place a molecule at a random location fails.  This is expensive in
         *   terms of computational power, and should thus be used sparingly.
         */
        findOpenMoleculeLocation: function() {
            var posX, posY;
            var minInitialInterParticleDistance;
            var moleculeDataSet = this.simulation.moleculeDataSet;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;

            if (moleculeDataSet.atomsPerMolecule === 1)
                minInitialInterParticleDistance = 1.2;
            else
                minInitialInterParticleDistance = 1.5;

            var rangeX = this.simulation.getNormalizedContainerWidth()  - (2 * PhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
            var rangeY = this.simulation.getNormalizedContainerHeight() - (2 * PhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
            for (var i = 0; i < rangeX / minInitialInterParticleDistance; i++) {
                for (var j = 0; j < rangeY / minInitialInterParticleDistance; j++) {
                    posX = PhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (i * minInitialInterParticleDistance);
                    posY = PhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (j * minInitialInterParticleDistance);

                    // See if this position is available.
                    var positionAvailable = true;
                    for (var k = 0; k < moleculeDataSet.getNumberOfMolecules(); k++) {
                        if (moleculeCenterOfMassPositions[k].distance(posX, posY) < minInitialInterParticleDistance) {
                            positionAvailable = false;
                            break;
                        }
                    }
                    if (positionAvailable) {
                        // We found an open position.
                        return new Vector2(posX, posY);
                    }
                }
            }
            console.error('No open positions available for molecule.');
            return null;
        }

    });

    /**
     * Static constants
     */
    _.extend(PhaseStateChanger, Constants.PhaseStateChanger);


    return PhaseStateChanger;
});
