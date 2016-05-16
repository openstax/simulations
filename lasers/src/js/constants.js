define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var DEG_TO_RAD = Math.PI / 180;

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    // Clock parameters
    Constants.DT = 12;
    Constants.FPS = 25;

    //----------------------------------------------------------------
    // Physical configuration
    //----------------------------------------------------------------

    // Photon speed
    Constants.ONE_ATOM_PHOTON_SPEED = 0.5;
    Constants.MULTI_ATOM_PHOTON_SPEED = 0.5;

    // Physical things
    Constants.ORIGIN = new Vector2(120, 200);

    // Beam parameters
	Constants.MINIMUM_SEED_PHOTON_RATE    = 0;
	Constants.MAXIMUM_SEED_PHOTON_RATE    = 30;
	Constants.MINIMUM_PUMPING_PHOTON_RATE = 0;
	Constants.MAXIMUM_PUMPING_PHOTON_RATE = 400;
	Constants.PUMPING_BEAM_FANOUT         = 45 * DEG_TO_RAD;
	Constants.SEED_BEAM_FANOUT            =  1 * DEG_TO_RAD;

    // Spontaneous emission times, in milliseconds
	Constants.MAXIMUM_STATE_LIFETIME        = 400;
	Constants.MINIMUM_GROUND_STATE_LIFETIME = 200;

    // Angle within which a photon is considered to be moving horizontally. This 
    //   is used by the mirrors to "cheat" photons into lasing, and by the wave
    //   graphic to determine its amplitude
    Constants.PHOTON_CHEAT_ANGLE = 3 * DEG_TO_RAD;

    // Thickness of the mirror graphics
    Constants.MIRROR_THICKNESS = 15;

    // Threshold number of horizontal photons that is considered "lasing"
    Constants.LASING_THRESHOLD = 40;

    // Number of photons in the system that will cause the thing to blow up
    Constants.KABOOM_THRESHOLD = 300;

    // The period over which the number of atoms in each level is averaged before
    //   the number of atoms is updated for the energy levels monitor panel
    Constants.ENERGY_LEVEL_MONITOR_AVERAGING_PERIOD = 0;

    Constants.ENABLE_ALL_STIMULATED_EMISSIONS = true;

    Constants.PHOTON_DISCRETE = 0;
    Constants.PHOTON_WAVE = 1;
    Constants.PHOTON_CURTAIN = 2;


    /*************************************************************************
     **                                                                     **
     **                        BASE LASER SIMULATION                        **
     **                                                                     **
     *************************************************************************/

    var BaseLaserSimulation = {};

    Constants.BaseLaserSimulation = BaseLaserSimulation;

    return Constants;
});
