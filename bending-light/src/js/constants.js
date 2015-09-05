define(function (require) {

    'use strict';

    var WavelengthColors = require('common/colors/wavelength');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    
    Constants.SPEED_OF_LIGHT = 2.99792458E8;
    Constants.WAVELENGTH_RED = 650E-9;
    Constants.WHITE_LIGHT = 1;

    // To come up with a good time scale dt, use lambda = v/f.  
    // For lambda = RED_WAVELENGTH and C=SPEED_OF_LIGHT, we have f=4.612E14
    Constants.RED_LIGHT_FREQUENCY = Constants.SPEED_OF_LIGHT / Constants.WAVELENGTH_RED;

    // Speed up by a factor of 2.5 because default wave view was moving too slow
    Constants.TIME_SPEEDUP_SCALE = 2.5; 

    // Thirty frames per cycle times the speedup scale
    Constants.MAX_DT = 1.0 / Constants.RED_LIGHT_FREQUENCY / 30 * Constants.TIME_SPEEDUP_SCALE;
    Constants.MIN_DT = Constants.MAX_DT / 10;
    Constants.DEFAULT_DT = Constants.MAX_DT / 4; // Seconds
    Constants.FRAME_DURATION = 20 / 1000; // Seconds
    Constants.INTERFACE_DT_SCALE = 1e17;

    // A good size for the units being used in the sim; used to determine the 
    //   dimensions of various model objects
    Constants.CHARACTERISTIC_LENGTH = Constants.WAVELENGTH_RED;

    Constants.MODEL_WIDTH = Constants.CHARACTERISTIC_LENGTH * 62;
    Constants.MODEL_HEIGHT = Constants.MODEL_WIDTH * 0.7;

    Constants.METERS_TO_NANOMETERS = 1e9;

    // Materials
    Constants.DEFAULT_LASER_DISTANCE_FROM_PIVOT = 8.125E-6;
    Constants.DIAMOND_INDEX_OF_REFRACTION_FOR_RED_LIGHT = 2.419;

    Constants.MIN_INDEX_OF_REFRACTION = 1;
    Constants.MAX_INDEX_OF_REFRACTION = 1.6;

    // Wavelengths to colors
    Constants.wavelengthToHex = function(wavelength, returnHexInteger) {
        var nm = wavelength * Constants.METERS_TO_NANOMETERS; // Convert to nanometers
        return WavelengthColors.nmToHex(nm, returnHexInteger);
    };

    Constants.wavelengthToRgba = function(wavelength, alpha) {
        var nm = wavelength * Constants.METERS_TO_NANOMETERS; // Convert to nanometers
        return WavelengthColors.nmToRgba(nm, alpha);
    };

    Constants.MIN_WAVELENGTH = WavelengthColors.MIN_WAVELENGTH;
    Constants.MAX_WAVELENGTH = 700;

    /*************************************************************************
     **                                                                     **
     **                                LASER                                **
     **                                                                     **
     *************************************************************************/

    var Laser = {};
    
    // So the refracted wave mode doesn't get too big because at angle = PI
    //   it would become infinite.  This value was determined by printing out
    //   actual angle values at runtime and sampling a good value.
	Laser.MAX_ANGLE_IN_WAVE_MODE = 3.0194;

	Constants.Laser = Laser;


    /*************************************************************************
     **                                                                     **
     **                            LASER BEAM VIEW                          **
     **                                                                     **
     *************************************************************************/

    var LaserBeamsView = {};

    LaserBeamsView.LASER_BEAM_WIDTH = 3;
    LaserBeamsView.CLIPPER_COORDINATE_SCALE = 10;

    Constants.LaserBeamsView = LaserBeamsView;


    return Constants;
});
