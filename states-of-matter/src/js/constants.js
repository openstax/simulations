define(function (require) {

    'use strict';

    var Rectangle = require('common/math/rectangle');


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    // Maximum number of atoms that can be simulated.
    Constants.MAX_NUM_ATOMS = 500;

    // Dimensions of the container in which the particles will reside, in picometers.
    Constants.PARTICLE_CONTAINER_WIDTH = 10000;
    Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT = Constants.PARTICLE_CONTAINER_WIDTH * 1.00;
    Constants.CONTAINER_BOUNDS = new Rectangle(0, 0, Constants.PARTICLE_CONTAINER_WIDTH, Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT);

    // Maximum temperature, in degrees Kelvin, that the Thermometer will display.
    Constants.MAX_DISPLAYED_TEMPERATURE = 1000;

    // Lennard-Jones potential interaction values for multiatomic atoms.
    Constants.EPSILON_FOR_DIATOMIC_OXYGEN = 113; // Epsilon/k-Boltzmann is in Kelvin.
    Constants.SIGMA_FOR_DIATOMIC_OXYGEN = 365;   // In picometers.
    Constants.EPSILON_FOR_WATER = 200;           // Epsilon/k-Boltzmann is in Kelvin.
    Constants.SIGMA_FOR_WATER = 444;             // In picometers.

    // Max and min values for parameters of Lennard-Jones potential 
    // calculations.  These are used in places were non-normalized LJ
    // calculations are made, graphed, and otherwise controlled.
    Constants.MAX_SIGMA = 500;      // In picometers.
    Constants.MIN_SIGMA = 75;       // In picometers.
    Constants.MAX_EPSILON = 450;    // Epsilon/k-Boltzmann is in Kelvin.
    Constants.MIN_EPSILON = 20;     // Epsilon/k-Boltzmann is in Kelvin.

    // Constants used to describe the the spatial relationship between 
    Constants.THETA_HOH = 120 * Math.PI / 180;  // This is not quite the real value for a water
    // molecule, but it is close and worked better in
    // the simulation.
    Constants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN = 1.0 / 3.12;  // Number supplied by Paul Beale.

    // Distance between diatomic pairs.
    Constants.DIATOMIC_PARTICLE_DISTANCE = 0.9;  // In particle diameters.

    Constants.BONDED_PARTICLE_DISTANCE = 0.9;  // In particle diameters.

    // Boltzmann's constant.
    Constants.K_BOLTZMANN = 1.38E-23; 


    /*************************************************************************
     **                                                                     **
     **                              MOLECULES                              **
     **                                                                     **
     *************************************************************************/

    var MoleculeTypes = {};

    // Identifiers for the various supported molecules.
    MoleculeTypes.NEON             = 1;
    MoleculeTypes.ARGON            = 2;
    MoleculeTypes.MONATOMIC_OXYGEN = 3;
    MoleculeTypes.DIATOMIC_OXYGEN  = 4;
    MoleculeTypes.WATER            = 5;
    MoleculeTypes.USER_DEFINED     = 6;

    Constants.MoleculeTypes = MoleculeTypes;


    /*************************************************************************
     **                                                                     **
     **                                ATOMS                                **
     **                                                                     **
     *************************************************************************/

    var Atoms = {};

    Atoms.ArgonAtom = {
        RADIUS: 181,      // In picometers.
        MASS: 39.948     // In atomic mass units.
    };
    Atoms.HydrogenAtom = {
        RADIUS: 120,      // In picometers.
        MASS: 1.00794     // In atomic mass units.
    };
    Atoms.NeonAtom = {
        RADIUS: 154,      // In picometers.
        MASS: 20.1797     // In atomic mass units.
    };
    Atoms.OxygenAtom = {
        RADIUS: 181,     // In picometers.
        MASS: 39.948     // In atomic mass units.
    };

    Constants.Atoms = Atoms;



    return Constants;
});
