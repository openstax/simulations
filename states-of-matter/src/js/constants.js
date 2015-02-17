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


    /*************************************************************************
     **                                                                     **
     **                              SIMULATION                             **
     **                                                                     **
     *************************************************************************/

    var SOMSimulation = {};

    // The internal model temperature values for the various states.
    SOMSimulation.SOLID_TEMPERATURE = 0.15;
    SOMSimulation.SLUSH_TEMPERATURE = 0.33;
    SOMSimulation.LIQUID_TEMPERATURE = 0.34;
    SOMSimulation.GAS_TEMPERATURE = 1.0;

    // Constants that control various aspects of the model behavior.
    SOMSimulation.DEFAULT_MOLECULE = MoleculeTypes.NEON;
    SOMSimulation.INITIAL_TEMPERATURE = SOMSimulation.SOLID_TEMPERATURE;
    SOMSimulation.MAX_TEMPERATURE = 50.0;
    SOMSimulation.MIN_TEMPERATURE = 0.0001;
    SOMSimulation.INITIAL_GRAVITATIONAL_ACCEL = 0.045;
    SOMSimulation.MAX_GRAVITATIONAL_ACCEL = 0.4;
    SOMSimulation.MAX_TEMPERATURE_CHANGE_PER_ADJUSTMENT = 0.025;
    SOMSimulation.TICKS_PER_TEMP_ADJUSTMENT = 10;
    SOMSimulation.MIN_INJECTED_MOLECULE_VELOCITY = 0.5;
    SOMSimulation.MAX_INJECTED_MOLECULE_VELOCITY = 2.0;
    SOMSimulation.MAX_INJECTED_MOLECULE_ANGLE = Math.PI * 0.8;
    SOMSimulation.VERLET_CALCULATIONS_PER_CLOCK_TICK = 8;

    // Constants used for setting the phase directly.
    SOMSimulation.PHASE_SOLID = 1;
    SOMSimulation.PHASE_LIQUID = 2;
    SOMSimulation.PHASE_GAS = 3;
    SOMSimulation.INJECTION_POINT_HORIZ_PROPORTION = 0.95;
    SOMSimulation.INJECTION_POINT_VERT_PROPORTION = 0.5;

    // Possible thermostat settings.
    SOMSimulation.NO_THERMOSTAT = 0;
    SOMSimulation.ISOKINETIC_THERMOSTAT = 1;
    SOMSimulation.ANDERSEN_THERMOSTAT = 2;
    SOMSimulation.ADAPTIVE_THERMOSTAT = 3;

    // Parameters to control rates of change of the container size.
    SOMSimulation.MAX_PER_TICK_CONTAINER_SHRINKAGE = 50;
    SOMSimulation.MAX_PER_TICK_CONTAINER_EXPANSION = 200;

    // Countdown value used when recalculating temperature when the
    // container size is changing.
    SOMSimulation.CONTAINER_SIZE_CHANGE_RESET_COUNT = 25;

    // Range for deciding if the temperature is near the current set point.
    // The units are internal model units.
    SOMSimulation.TEMPERATURE_CLOSENESS_RANGE = 0.15;

    // Constant for deciding if a particle should be considered near to the
    // edges of the container.
    SOMSimulation.PARTICLE_EDGE_PROXIMITY_RANGE = 2.5;

    // Values used for converting from model temperature to the temperature
    // for a given particle.
    SOMSimulation.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE = 0.26;    // Empirically determined.
    SOMSimulation.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE = 0.8;  // Empirically determined.
    SOMSimulation.NEON_TRIPLE_POINT_IN_KELVIN = 23;   // Tweaked a little from actual value for better temperature mapping.
    SOMSimulation.NEON_CRITICAL_POINT_IN_KELVIN = 44;
    SOMSimulation.ARGON_TRIPLE_POINT_IN_KELVIN = 75;  // Tweaked a little from actual value for better temperature mapping.
    SOMSimulation.ARGON_CRITICAL_POINT_IN_KELVIN = 151;
    SOMSimulation.O2_TRIPLE_POINT_IN_KELVIN = 54;
    SOMSimulation.O2_CRITICAL_POINT_IN_KELVIN = 155;
    SOMSimulation.WATER_TRIPLE_POINT_IN_KELVIN = 273;
    SOMSimulation.WATER_CRITICAL_POINT_IN_KELVIN = 647;

    // The following values are used for temperature conversion for the
    // adjustable molecule.  These are somewhat arbitrary, since in the real
    // world the values would change if epsilon were changed.  They have been
    // chosen to be similar to argon, because the default epsilon value is
    // half of the allowable range, and this value ends up being similar to
    // argon.
    SOMSimulation.ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN = 75;
    SOMSimulation.ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN = 140;

    // Min a max values for adjustable epsilon.  Originally there was a wider
    // allowable range, but the simulation did not work so well, so the range
    // below was arrived at empirically and seems to work reasonably well.
    SOMSimulation.MIN_ADJUSTABLE_EPSILON = 1.5 * Atoms.NeonAtom.EPSILON;
    SOMSimulation.MAX_ADJUSTABLE_EPSILON = Constants.EPSILON_FOR_WATER;

    Constants.SOMSimulation = SOMSimulation;


    /*************************************************************************
     **                                                                     **
     **                         PHASE STATE CHANGER                         **
     **                                                                     **
     *************************************************************************/

    var PhaseStateChanger = {};

    PhaseStateChanger.SOLID  = 1;
    PhaseStateChanger.LIQUID = 2;
    PhaseStateChanger.GAS    = 3;

    PhaseStateChanger.DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL = 0.12;  // In particle diameters.
    PhaseStateChanger.MAX_PLACEMENT_ATTEMPTS = 500; // For random placement of particles.
    PhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = 2.5;

    Constants.PhaseStateChanger = PhaseStateChanger;


    var MonatomicPhaseStateChanger = {};

    MonatomicPhaseStateChanger.MIN_INITIAL_INTER_PARTICLE_DISTANCE = 1.12;

    Constants.MonatomicPhaseStateChanger = MonatomicPhaseStateChanger;


    var DiatomicPhaseStateChanger = {};

    DiatomicPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE = 2.0;
    // The following constants can be adjusted to make the the corresponding
    //   phase more or less dense.
    DiatomicPhaseStateChanger.LIQUID_SPACING_FACTOR = 0.7;
    DiatomicPhaseStateChanger.GAS_SPACING_FACTOR = 1.0;

    Constants.DiatomicPhaseStateChanger = DiatomicPhaseStateChanger;


    var WaterPhaseStateChanger = {};

    WaterPhaseStateChanger.MIN_INITIAL_DIAMETER_DISTANCE = 1.4;
    // The following constants can be adjusted to make the the corresponding
    //   phase more or less dense.
    WaterPhaseStateChanger.LIQUID_SPACING_FACTOR = 0.8;
    WaterPhaseStateChanger.GAS_SPACING_FACTOR = 1.0;

    Constants.WaterPhaseStateChanger = WaterPhaseStateChanger;
    

    /*************************************************************************
     **                                                                     **
     **                           VERLET ALGORITHM                          **
     **                                                                     **
     *************************************************************************/

    var VerletAlgorithm = {};

    // Constants that control various aspects of the Verlet algorithm.
    VerletAlgorithm.TIME_STEP = 0.020;  // Time per simulation clock tick, in seconds.
    VerletAlgorithm.TIME_STEP_SQR_HALF = VerletAlgorithm.TIME_STEP * VerletAlgorithm.TIME_STEP * 0.5;
    VerletAlgorithm.TIME_STEP_HALF = VerletAlgorithm.TIME_STEP / 2;
    VerletAlgorithm.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD = 6.25;
    VerletAlgorithm.PRESSURE_CALC_WEIGHTING = 0.999;
    VerletAlgorithm.WALL_DISTANCE_THRESHOLD = 1.122462048309373017;
    VerletAlgorithm.SAFE_INTER_MOLECULE_DISTANCE = 2.0;

    // Constant used to limit how close the atoms are allowed to get to one
    //   another so that we don't end up getting crazy big forces.
    VerletAlgorithm.MIN_DISTANCE_SQUARED = 0.7225;

    // Parameters that control the increasing of gravity as the temperature
    //   approaches zero.  This is done to counteract the tendency of the
    //   thermostat to slow falling molecules noticeably at low temps.  This
    //   is a "hollywooding" thing.
    VerletAlgorithm.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES = 0.10;
    VerletAlgorithm.LOW_TEMPERATURE_GRAVITY_INCREASE_RATE = 50;

    // Pressure at which explosion of the container will occur.
    VerletAlgorithm.EXPLOSION_PRESSURE = 1.05;  // Currently set so that container blows roughly
                                                //   when the pressure gauge hits its max value.

    Constants.VerletAlgorithm = VerletAlgorithm;


    var WaterVerletAlgorithm = {};

    // Parameters used for "hollywooding" of the water crystal.
    WaterVerletAlgorithm.WATER_FULLY_MELTED_TEMPERATURE = 0.3;
    WaterVerletAlgorithm.WATER_FULLY_MELTED_ELECTROSTATIC_FORCE = 1.0;
    WaterVerletAlgorithm.WATER_FULLY_FROZEN_TEMPERATURE = 0.22;
    WaterVerletAlgorithm.WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE = 4.0;
    WaterVerletAlgorithm.MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER = 3.0;

    Constants.WaterVerletAlgorithm = WaterVerletAlgorithm;



    return Constants;
});
