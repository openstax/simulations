define(function (require) {

    'use strict';


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
    Constants.Calcium = Calcium;

    var Copper = {};
    Constants.Copper = Copper;

    var Platinum = {};
    Constants.Platinum = Platinum;

    var Sodium = {};
    Constants.Sodium = Sodium;

    var Zinc = {};
    Constants.Zinc = Zinc;

    var Photon = {};
    Constants.Photon = Photon;

    var Electron = {};
    Constants.Electron = Electron;


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
