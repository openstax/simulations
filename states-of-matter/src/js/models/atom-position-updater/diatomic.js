define(function (require) {

    'use strict';

    var HALF_DIATOMIC_PARTICLE_DISTANCE = require('constants').DIATOMIC_PARTICLE_DISTANCE / 2;

    var DiatomicAtomPositionUpdater = {

        updateAtomPositions: function(moleculeDataSet) {
            // Make sure this is not being used on an inappropriate data set.
            if (moleculeDataSet.atomsPerMolecule !== 2)
                return;

            // Get direct references to the data in the data set.
            var atomPositions = moleculeDataSet.atomPositions;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
            var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

            var xPos;
            var yPos;
            var cosineTheta;
            var sineTheta;

            // Position the atoms to match the position of the molecules.
            for (var i = 0; i < numberOfMolecules; i++) {
                cosineTheta = Math.cos(moleculeRotationAngles[i]);
                sineTheta   = Math.sin(moleculeRotationAngles[i]);

                xPos = moleculeCenterOfMassPositions[i].x + cosineTheta * HALF_DIATOMIC_PARTICLE_DISTANCE;
                yPos = moleculeCenterOfMassPositions[i].y + sineTheta * HALF_DIATOMIC_PARTICLE_DISTANCE;
                atomPositions[i * 2].set(xPos, yPos);
                
                xPos = moleculeCenterOfMassPositions[i].x - cosineTheta * HALF_DIATOMIC_PARTICLE_DISTANCE;
                yPos = moleculeCenterOfMassPositions[i].y - sineTheta * HALF_DIATOMIC_PARTICLE_DISTANCE;
                atomPositions[i * 2 + 1].set(xPos, yPos);
            }
        }

    };

    return DiatomicAtomPositionUpdater;
});
