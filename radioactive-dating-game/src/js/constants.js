define(function (require) {

    'use strict';

    var NucleusType = require('models/nucleus-type');

    var Constants = require('nuclear-physics/constants'); 

    // Preferred distance between nucleus centers when placing them on the canvas.
    Constants.PREFERRED_INTER_NUCLEUS_DISTANCE = 15;  // In femtometers.
    // Minimum distance between the center of a nucleus and a wall or other obstacle.
    Constants.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE = 10;  // In femtometers.


    /*************************************************************************
     **                                                                     **
     **                        HALF-LIFE SIMULATION                         **
     **                                                                     **
     *************************************************************************/

    var HalfLifeSimulation = {};

    HalfLifeSimulation.MAX_NUCLEI = 99;
    HalfLifeSimulation.DEFAULT_NUCLEUS_TYPE = NucleusType.CARBON_14;
    
    // Size and position of the bucket of nuclei which the user uses to add
    //   nuclei to the simulation.
    HalfLifeSimulation.BUCKET_ORIGIN_X = 40;
    HalfLifeSimulation.BUCKET_ORIGIN_Y = 40;
    HalfLifeSimulation.BUCKET_WIDTH = 45;
    HalfLifeSimulation.BUCKET_HEIGHT = HalfLifeSimulation.BUCKET_WIDTH * 0.65;

    Constants.HalfLifeSimulation = HalfLifeSimulation;


    /*************************************************************************
     **                                                                     **
     **                        HALF-LIFE SIMULATION                         **
     **                                                                     **
     *************************************************************************/

    var DecayRatesSimulation = {};

    DecayRatesSimulation.MAX_NUCLEI = 1000;
    DecayRatesSimulation.DEFAULT_NUCLEUS_TYPE = NucleusType.CARBON_14;
    DecayRatesSimulation.INITIAL_WORLD_WIDTH = 800;  // In femtometers
    DecayRatesSimulation.INITIAL_WORLD_HEIGHT = DecayRatesSimulation.INITIAL_WORLD_WIDTH * 0.4;  // In femtometers
    
    DecayRatesSimulation.PLACEMENT_LOCATION_SEARCH_COUNT = 100;
    DecayRatesSimulation.DEFAULT_MIN_INTER_NUCLEUS_DISTANCE = 10;

    Constants.DecayRatesSimulation = DecayRatesSimulation;


    return Constants;
});
