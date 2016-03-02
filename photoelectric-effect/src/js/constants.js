define(function (require) {

    'use strict';

    var DEG_TO_RAD = Math.PI / 180;

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    var Circuit = {};
    Constants.Circuit = Circuit;

    var BeamControl = {};
    Constants.BeamControl = BeamControl;

    var CircuitView = {};
    Constants.CircuitView = CircuitView;


    var Calcium = {};

    Calcium.NAME = 'Calcium';
    Calcium.ENERGY_LEVELS = [ -13.6 ];
    Calcium.WORK_FUNCTION = 2.9;

    Constants.Calcium = Calcium;


    var Copper = {};

    Copper.NAME = 'Copper';
    Copper.ENERGY_LEVELS = [ -13.6 ];
    Copper.WORK_FUNCTION = 4.7;

    Constants.Copper = Copper;


    var Magnesium = {};

    Magnesium.NAME = '?????';
    Magnesium.ENERGY_LEVELS = [ -13.6 ];
    Magnesium.WORK_FUNCTION = 3.7;
    
    Constants.Magnesium = Magnesium;


    var Platinum = {};

    Platinum.NAME = 'Platinum';
    Platinum.ENERGY_LEVELS = [ -13.6 ];
    Platinum.WORK_FUNCTION = 6.3;

    Constants.Platinum = Platinum;


    var Sodium = {};

    Sodium.NAME = 'Sodium';
    Sodium.ENERGY_LEVELS = [
        -5.14
        -3.03
        -1.95
        -1.52
        -1.39
        -1.02
        -0.86
    ];
    Sodium.WORK_FUNCTION = 2.3;

    Constants.Sodium = Sodium;


    var Zinc = {};

    Zinc.NAME = 'Zinc';
    Zinc.ENERGY_LEVELS = [ -13.6 ];
    Zinc.WORK_FUNCTION = 4.3;

    Constants.Zinc = Zinc;


    /*************************************************************************
     **                                                                     **
     **                             SIMULATION                              **
     **                                                                     **
     *************************************************************************/

    var PEffectSimulation = {};
    
    PEffectSimulation.ELECTRON_MODEL_SIMPLE = 1;
    PEffectSimulation.ELECTRON_MODEL_REALISTIC = 2;

    // Factor to make the analytically reported current different than the
    //   photons-per-sec that come from the beam
    PEffectSimulation.CURRENT_JIMMY_FACTOR = 0.015;

    // Factor to make voltage across electrodes display properly calibrated
    PEffectSimulation.VOLTAGE_SCALE_FACTOR = 1;

    PEffectSimulation.MIN_VOLTAGE = -8;
    PEffectSimulation.MAX_VOLTAGE = 8;
    PEffectSimulation.MIN_WAVELENGTH = 100;
    PEffectSimulation.MAX_WAVELENGTH = 800;
    PEffectSimulation.MAX_PHOTONS_PER_SECOND = 500;
    PEffectSimulation.MAX_CURRENT = PEffectSimulation.MAX_PHOTONS_PER_SECOND * PEffectSimulation.CURRENT_JIMMY_FACTOR / 8;

    PEffectSimulation.DEFAULT_BEAM_WAVELENGTH = 400;
    PEffectSimulation.BEAM_WIDTH  =   80;
    PEffectSimulation.BEAM_HEIGHT = 1000;
    PEffectSimulation.BEAM_SOURCE_TO_TARGET_DISTANCE = 260;
    PEffectSimulation.BEAM_ANGLE = 130 * DEG_TO_RAD;
    PEffectSimulation.BEAM_FANOUT =  5 * DEG_TO_RAD;

    PEffectSimulation.DEFAULT_TARGET_POTENTIAL = 0;

    Constants.PEffectSimulation = PEffectSimulation;


    /*************************************************************************
     **                                                                     **
     **                        PHOTOELECTRIC TARGET                         **
     **                                                                     **
     *************************************************************************/

    var PhotoelectricTarget = {};

    PhotoelectricTarget.ELECTRON_MASS = 9.11E-31;
    PhotoelectricTarget.SPEED_SCALE_FACTOR = 5E-16;
    PhotoelectricTarget.MINIMUM_SPEED = 0.1;

    Constants.PhotoelectricTarget = PhotoelectricTarget;


    /*************************************************************************
     **                                                                     **
     **                  METAL ENERGY ABSORPTION STRATEGY                   **
     **                                                                     **
     *************************************************************************/

    var MetalEnergyAbsorptionStrategy = {};

    MetalEnergyAbsorptionStrategy.NUM_SUB_LEVELS = 20;
    // Total energy depth across all sublevels, in eV
    MetalEnergyAbsorptionStrategy.TOTAL_ENERGY_DEPTH = 4;

    Constants.MetalEnergyAbsorptionStrategy = MetalEnergyAbsorptionStrategy;

    


    return Constants;
});
