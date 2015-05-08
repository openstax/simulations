define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SPEED_OF_LIGHT = 0.01 * 1000; 

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

    Constants.DEFAULT_TIME_DELTA_PER_TICK = 1 / 10;
    Constants.DEFAULT_DELAY_BETWEEN_TICKS = 1 / 30;


    /*************************************************************************
     **                                                                     **
     **                                EARTH                                **
     **                                                                     **
     *************************************************************************/

    var Earth = {};

    Earth.RADIUS = 6370;
    Earth.DIAMETER = Earth.RADIUS * 2;
    Earth.BASE_TEMPERATURE = 251;
    Earth.MAX_EMISSIVITY = 10;
    Earth.DEFAULT_EMISSIVITY = Earth.MAX_EMISSIVITY / 2;
    Earth.PHOTON_EMISSION_TIME = Constants.DEFAULT_TIME_DELTA_PER_TICK;

    Constants.Earth = Earth;


    /*************************************************************************
     **                                                                     **
     **                                 SUN                                 **
     **                                                                     **
     *************************************************************************/

    var Sun = {};

    Sun.DIAMETER = Earth.DIAMETER * 5;
    Sun.RADIUS = Sun.DIAMETER / 2;
    Sun.DISTANCE_FROM_EARTH = Sun.DIAMETER * 5;
    Sun.DEFAULT_PRODUCTION_RATE = 0.034 * 1000;

    Constants.Sun = Sun;


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


    /*************************************************************************
     **                                                                     **
     **                               PHOTON                                **
     **                                                                     **
     *************************************************************************/

    var PhotonView = {};

    PhotonView.MODEL_DIAMETER = 0.46; // Meters, model space

    Constants.PhotonView = PhotonView;



    return Constants;
});
