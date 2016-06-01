define(function (require) {

    'use strict';

    var WavelengthColors = require('common/colors/wavelength');

    var Constants = require('nuclear-physics/constants'); 

    var Dimension = function(width, height) {
        this.width = width;
        this.height = height;
    };

    var RSConstants = {
        //----------------------------------------------------------------------------
        // Model
        //----------------------------------------------------------------------------

        // alpha particle
        MIN_ALPHA_ENERGY: 50,
        MAX_ALPHA_ENERGY: 100,
        DEFAULT_ALPHA_ENERGY: 80,

        DEFAULT_SHOW_TRACES: false,

        // protons
        MIN_PROTON_COUNT: 20,
        MAX_PROTON_COUNT: 100,
        DEFAULT_PROTON_COUNT: 79,

        // neutrons
        MIN_NEUTRON_COUNT: 20,
        MAX_NEUTRON_COUNT: 150,
        DEFAULT_NEUTRON_COUNT: 118,


        // ray gun
        MAX_PARTICLES: 20,
        GUN_INTENSITY: 1,
        X0_MIN: 10,

        //----------------------------------------------------------------------------
        // Dimensions
        //----------------------------------------------------------------------------

        // Animation space size, must be square!
        SPACE_NODE_WIDTH: 490,
        SPACE_NODE_HEIGHT: 490,

        // Animation space size, must be square!
        BOX_SIZE: 360,
        BOX_SIZE_SMALL: 320,

        RUTHERFORD_ACTUAL: 150,
        PUDDING_ACTUAL: 300,

        PARTICLE_SCALE: 4,

        RayGunView: {
            WIDTH: 20,
            BARREL_CENTER_X: 0.37,
            BARREL_CENTER_Y: 0.5,
            RAY_WIDTH: 0.4,
            RAY_HEIGHT: 0.75
        },

        AtomView: {
            OUTLINE_LINE_WIDTH: 1.5,
            OUTLINE_LINE_DASH: [ 2, 3 ],
            OUTLINE_STROKE_COLOR: 0XFFFFFF,
            ELECTRON_ANGULAR_SPEED: 0.75
        },

        PuddingView: {
            ELECTRON_COUNT: 79
        }
    };

    RSConstants.AtomModel = {
        MIN_NUCLEUS_RADIUS: 14,
        MIN_PARTICLE_COUNT: RSConstants.MIN_PROTON_COUNT + RSConstants.MIN_NEUTRON_COUNT,
        MAX_PARTICLE_COUNT: RSConstants.MAX_PROTON_COUNT + RSConstants.MAX_NEUTRON_COUNT,
        PARTICLE_COUNT_EXP: 0.333
    };

    _.extend(Constants, RSConstants);

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/
    
    //----------------------------------------------------------------------------
    // Dimensions
    //----------------------------------------------------------------------------
    
    Constants.CANVAS_RENDERING_SIZE = new Dimension(750, 750);
    // Animation box size, must be square!
    Constants.ANIMATION_BOX_SIZE = new Dimension(475, 475);
    Constants.TINY_BOX_SIZE = new Dimension(10, 10);
    Constants.BOX_OF_HYDROGEN_SIZE = new Dimension(70, 70);
    Constants.BOX_OF_HYDROGEN_DEPTH = 10;
    Constants.BEAM_SIZE = new Dimension((0.75 * Constants.BOX_OF_HYDROGEN_SIZE.width), 75);
    
    // Spectrometer
    Constants.SPECTROMETER_SIZE = new Dimension(500, 210);
    
    //----------------------------------------------------------------------------
    // Clock
    //----------------------------------------------------------------------------
    
    Constants.CLOCK_FRAME_RATE = 25; // fps, frames per second (wall time)
    
    // The clock control area has a slider for choosing a clock "speed".
    // These are the clock steps that correspond to each speed setting.
    Constants.CLOCK_STEPS = [
        0.5, 2, 6
    ];
    
    // Color for photon used on controls & in legends
    Constants.PHOTON_ICON_WAVELENGTH = 600; // nm
    
    //----------------------------------------------------------------------------
    // Model
    //----------------------------------------------------------------------------
    
    Constants.MIN_WAVELENGTH = 92;
    Constants.MAX_WAVELENGTH = WavelengthColors.MAX_WAVELENGTH;
    
    Constants.PHOTON_INITIAL_SPEED = 5; // distance moved per dt
    Constants.ALPHA_PARTICLE_INITIAL_SPEED = 5; // distance moved per dt
    
    //----------------------------------------------------------------------------
    // Ranges
    //----------------------------------------------------------------------------
    
    Constants.SPECTROMETER_MIN_WAVELENGTH = Constants.MIN_WAVELENGTH;
    Constants.SPECTROMETER_MAX_WAVELENGTH = 7500; // nm
    
    //----------------------------------------------------------------------------
    // Features
    //----------------------------------------------------------------------------
    
    // Shows the atom's state variables in the lower right corner of the animation box
    Constants.SHOW_STATE_DISPLAY = true;
    
    // deBroglie view control can be in either menu bar or play area
    Constants.DEBROGLIE_VIEW_IN_MENUBAR = false;


    return Constants;
});
