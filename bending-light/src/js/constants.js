define(function (require) {

    'use strict';

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    
    Constants.SPEED_OF_LIGHT = 2.99792458E8;
    Constants.WAVELENGTH_RED = 650E-9;

    // To come up with a good time scale dt, use lambda = v/f.  
    // For lambda = RED_WAVELENGTH and C=SPEED_OF_LIGHT, we have f=4.612E14
    Constants.RED_LIGHT_FREQUENCY = SPEED_OF_LIGHT / WAVELENGTH_RED;

    // Speed up by a factor of 2.5 because default wave view was moving too slow
    Constants.TIME_SPEEDUP_SCALE = 2.5; 

    // Thirty frames per cycle times the speedup scale
    Constants.MAX_DT = 1.0 / RED_LIGHT_FREQUENCY / 30 * TIME_SPEEDUP_SCALE;
    Constants.MIN_DT = MAX_DT / 10;
    Constants.DEFAULT_DT = MAX_DT / 4;

    // A good size for the units being used in the sim; used to determine the 
    //   dimensions of various model objects
    Constants.CHARACTERISTIC_LENGTH = WAVELENGTH_RED;



    // Materials
    Constants.DEFAULT_LASER_DISTANCE_FROM_PIVOT = 8.125E-6;
    Constants.DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;




    return Constants;
});
