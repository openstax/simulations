define(function (require) {

    'use strict';

    var WaterMoleculeStructure = require('models/water-molecule-structure');
    var structureX = WaterMoleculeStructure.moleculeStructureX;
    var structureY = WaterMoleculeStructure.moleculeStructureY;

    var HALF_BONDED_PARTICLE_DISTANCE = require('constants').BONDED_PARTICLE_DISTANCE / 2;


    var WaterAtomPositionUpdater = {

        updateAtomPositions: function(moleculeDataSet) {
            // Make sure this is not being used on an inappropriate data set.
            if (moleculeDataSet.atomsPerMolecule !== 3)
                return;

            // Get direct references to the data in the data set.
            var atomPositions = moleculeDataSet.atomPositions;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;

            var xPos;
            var yPos;
            var cosineTheta;
            var sineTheta;
            var i, j;

            var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
            for (i = 0; i < numberOfMolecules; i++) {
                cosineTheta = Math.cos(moleculeRotationAngles[i]);
                sineTheta   = Math.sin(moleculeRotationAngles[i]);

                xPos = moleculeCenterOfMassPositions[i].x + cosineTheta * HALF_BONDED_PARTICLE_DISTANCE;
                yPos = moleculeCenterOfMassPositions[i].y + sineTheta * HALF_BONDED_PARTICLE_DISTANCE;
                atomPositions[i * 2].set(xPos, yPos);

                xPos = moleculeCenterOfMassPositions[i].x - cosineTheta * HALF_BONDED_PARTICLE_DISTANCE;
                yPos = moleculeCenterOfMassPositions[i].y - sineTheta * HALF_BONDED_PARTICLE_DISTANCE;
                atomPositions[i * 2 + 1].set(xPos, yPos);
            }

            for (i = 0; i < numberOfMolecules; i++) {
                cosineTheta = Math.cos(moleculeRotationAngles[i]);
                sineTheta   = Math.sin(moleculeRotationAngles[i]);
                for (j = 0; j < 3; j++) {
                    xPos = moleculeCenterOfMassPositions[i].x + (cosineTheta * structureX[j]) - (sineTheta * structureY[j]);
                    yPos = moleculeCenterOfMassPositions[i].y + (sineTheta * structureX[j]) + (cosineTheta * structureY[j]);
                    atomPositions[i * 3 + j].set(xPos, yPos);
                }
            }
        }

    };

    return WaterAtomPositionUpdater;
});
