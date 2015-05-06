define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SPEED_OF_LIGHT = 0.01; 

    // Plank's constant
    Constants.h = 6.6310E-34;
    // Boltzmann's constant
    Constants.k = 1.3806503E-23;
    // Speed of light (m/s)
    Constants.C = 0.299792458E9;

    Constants.SUNLIGHT_WAVELENGTH = 400E-9;
    Constants.MICRO_WAVELENGTH    = 20;
    Constants.IR_WAVELENGTH       = 850E-9;
    Constants.VISIBLE_WAVELENGTH  = 580E-9;
    Constants.UV_WAVELENGTH       = 100E-9;


    /*************************************************************************
     **                                                                     **
     **                             ATMOSPHERE                              **
     **                                                                     **
     *************************************************************************/

    var Atmosphere = {};

    Atmosphere.TROPOSPHERE_THICKNESS  = 16;
    Atmosphere.STRATOSPHERE_THICKNESS = 30;

    Atmosphere.GREENHOUSE_GAS_CONCENTRATION_TODAY   = 0.0052;
    Atmosphere.GREENHOUSE_GAS_CONCENTRATION_1750    = 0.0050;
    Atmosphere.GREENHOUSE_GAS_CONCENTRATION_ICE_AGE = 0.0044;
    Atmosphere.MAX_GREENHOUSE_GAS_CONCENTRATION     = 0.009;
    Atmosphere.MIN_GREENHOUSE_GAS_CONCENTRATION     = 0.00001;
    Atmosphere.DEFAULT_GREENHOUSE_GAS_CONCENTRATION = Atmosphere.MIN_GREENHOUSE_GAS_CONCENTRATION;

    Constants.Atmosphere = Atmosphere;


    return Constants;
});
