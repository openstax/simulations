define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Constants = require('constants');

    /**
     * This defines the structure of the water molecule as the 
     *   distances of the atoms in the x and y from the center 
     *   of mass when the rotational angle is zero.
     */
    var atoms = [
        { 
            x: 0, 
            y: 0 
        },
        { 
            x: Constants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN, 
            y: 0 
        },
        { 
            x: Constants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN * Math.cos(Constants.THETA_HOH), 
            y: Constants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN * Math.sin(Constants.THETA_HOH) 
        }
    ];

    var moleculeStructureX = _.pluck(atoms, 'x');
    var moleculeStructureY = _.pluck(atoms, 'y');

    // Calculate center of mass and apply it
    var xcm0 = (moleculeStructureX[0] + 0.25 * moleculeStructureX[1] + 0.25 * moleculeStructureX[2]) / 1.5;
    var ycm0 = (moleculeStructureY[0] + 0.25 * moleculeStructureY[1] + 0.25 * moleculeStructureY[2]) / 1.5;

    for (int i = 0; i < atoms.length; i++) {
        moleculeStructureX[i] -= xcm0;
        moleculeStructureY[i] -= ycm0;
    }

    var rotationalInertia = (Math.pow(this.moleculeStructureX[0], 2) + Math.pow(this.moleculeStructureY[0], 2))
                   + 0.25 * (Math.pow(this.moleculeStructureX[1], 2) + Math.pow(this.moleculeStructureY[1], 2))
                   + 0.25 * (Math.pow(this.moleculeStructureX[2], 2) + Math.pow(this.moleculeStructureY[2], 2));

    /**
     * A singleton object that aids in molecule calculations
     */
    var WaterMoleculeStructure = {

        moleculeStructureX: moleculeStructureX,
        moleculeStructureY: moleculeStructureY,

        rotationalInertia: rotationalInertia

    };
    

    return WaterMoleculeStructure;
});
