define(function (require) {

    'use strict';


    var MonatomicAtomPositionUpdater = {

        updateAtomPositions: function(moleculeDataSet) {
            // Make sure this is not being used on an inappropriate data set.
            if (moleculeDataSet.atomsPerMolecule !== 1)
                return;

            // Get direct references to the data in the data set.
            var atomPositions = moleculeDataSet.atomPositions;
            var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
            var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

            // Position the atoms to match the position of the molecules.
            for (var i = 0; i < numberOfMolecules; i++)
                atomPositions[i].set(moleculeCenterOfMassPositions[i]);
        }

    };

    return MonatomicAtomPositionUpdater;
});
