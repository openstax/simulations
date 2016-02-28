define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.NUM_ENERGY_LEVELS = 2;
    Constants.MAX_NUM_ENERGY_LEVELS = 6;
    // Max energy is 0, in all cases (requested by Sam M., 10/24/06
    Constants.MAX_ENERGY_LEVEL = 0.0;

    // Object locations and dimensions. Everything is keyed off the location of the cathode
    Constants.ELECTRODE_Y_LOCATION = 275;
    Constants.ELECTRODE_LENGTH = 200;

    Constants.CATHODE_X_LOCATION = 130;
    Constants.CATHODE_LOCATION = new Vector2(Constants.CATHODE_X_LOCATION, Constants.ELECTRODE_Y_LOCATION);
    Constants.CATHODE_LENGTH = ELECTRODE_LENGTH;
    Constants.CATHODE_START = new Vector2(
		Constants.CATHODE_LOCATION.x,
		Constants.CATHODE_LOCATION.y - Constants.CATHODE_LENGTH / 2
    );
    Constants.CATHODE_END = new Vector2(
		Constants.CATHODE_LOCATION.x,
		Constants.CATHODE_LOCATION.y + Constants.CATHODE_LENGTH / 2
    );

    Constants.ANODE_X_LOCATION = 430 + Constants.CATHODE_X_LOCATION;
    Constants.ANODE_LOCATION = new Vector2(Constants.ANODE_X_LOCATION, Constants.ELECTRODE_Y_LOCATION);
    Constants.ANODE_LENGTH = Constants.ELECTRODE_LENGTH;
    Constants.ANODE_START = new Vector2(
		Constants.ANODE_LOCATION.x,
		Constants.ANODE_LOCATION.y - Constants.ANODE_LENGTH / 2
    );
    Constants.ANODE_END = new Vector2(
		Constants.ANODE_LOCATION.x,
		Constants.ANODE_LOCATION.y + Constants.ANODE_LENGTH / 2
    );

	Constants.ELECTRODE_TOP    = 15;
	Constants.ELECTRODE_LEFT   = 30;
	Constants.ELECTRODE_BOTTOM = 15;
	Constants.ELECTRODE_RIGHT  = 30;

    Constants.BEAM_CONTROL_CENTER_PT = new Vector2( 
    	(Constants.CATHODE_X_LOCATION + Constants.ANODE_X_LOCATION) / 2,
		195
	);

    // Clock specification
    Constants.DT = 12;
    Constants.FPS = 25;

    // Scale factors
    Constants.MODEL_TO_VIEW_DIST_FACTOR = 1E12;
    // Factor that scales pixels to real dimensional units
    Constants.PIXELS_PER_NM = 1E6;
    // Factor that converts volts on the control panel slider to real volts
    Constants.VOLTAGE_CALIBRATION_FACTOR = 1;
    // Factor that makes the electron acceleration come out right for the potential between the plates
    Constants.ELECTRON_ACCELERATION_CALIBRATION_FACTOR = 1 / 5.55;

    // Simulation time for which EnergySquiggles remain on the screen
    Constants.ENERGY_SQUIGGLE_PERSISTENCE = 50;


    /*************************************************************************
     **                                                                     **
     **                             SIMULATION                              **
     **                                                                     **
     *************************************************************************/

    var DischargeLampsSimulation = {};
    
    DischargeLampsSimulation.MAX_VOLTAGE = 30;
    DischargeLampsSimulation.MAX_STATES = 6;

    Constants.DischargeLampsSimulation = DischargeLampsSimulation;

    

    return Constants;
});
