define(function (require) {

    'use strict';

    var WavelengthColors = require('common/colors/wavelength');
    var Colors           = require('common/colors/colors');
    var range            = require('common/math/range');

    var Constants = require('nuclear-physics/constants'); 

    var DEG_TO_RAD = Math.PI / 180;

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

        PARTICLE_SCALE: 9,

        RayGunView: {
            WIDTH: 19,
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
    
    Constants.FRAME_RATE = 25; // fps, frames per second (wall time)
    
    // The clock control area has a slider for choosing a clock "speed".
    // These are the clock steps that correspond to each speed setting.
    Constants.DELTA_TIMES_PER_FRAME = [
        0.5, 2, 6
    ];
    Constants.DEFAULT_DELTA_TIME_PER_FRAME = Constants.DELTA_TIMES_PER_FRAME[1];
    
    // Color for photon used on controls & in legends
    Constants.PHOTON_ICON_WAVELENGTH = 600; // nm
    
    //----------------------------------------------------------------------------
    // Model
    //----------------------------------------------------------------------------
    
    Constants.MIN_WAVELENGTH = 92;
    Constants.MAX_WAVELENGTH = WavelengthColors.MAX_WAVELENGTH;
    Constants.WHITE_WAVELENGTH = 0;
    
    Constants.PHOTON_INITIAL_SPEED = 5; // distance moved per dt
    Constants.ALPHA_PARTICLE_INITIAL_SPEED = 5; // distance moved per dt
    Constants.NUCLEON_DIAMETER = 0.95;
    Constants.PHOTON_DIAMETER = 24;
    Constants.ELECTRON_HOLYWOOD_DIAMETER = 8;
    
    //----------------------------------------------------------------------------
    // Ranges
    //----------------------------------------------------------------------------
    
    Constants.SPECTROMETER_MIN_WAVELENGTH = Constants.MIN_WAVELENGTH;
    Constants.SPECTROMETER_MAX_WAVELENGTH = 7500; // nm

    //----------------------------------------------------------------------------
    // Colors
    //----------------------------------------------------------------------------

    Constants.UV_COLOR = '#888';
    Constants.IR_COLOR = Constants.UV_COLOR;

    /*************************************************************************
     **                                                                     **
     **                   ABSTRACT HYDROGEN ATOMIC MODEL                    **
     **                                                                     **
     *************************************************************************/

    var AbstractAtomicModel = {};

    AbstractAtomicModel.COLLISION_CLOSENESS = (Constants.PHOTON_DIAMETER / 2) + (Constants.ELECTRON_HOLYWOOD_DIAMETER / 2);
    AbstractAtomicModel.GROUND_STATE = 1;
    
    Constants.AbstractAtomicModel = AbstractAtomicModel;


    /*************************************************************************
     **                                                                     **
     **                         BILLIARD BALL MODEL                         **
     **                                                                     **
     *************************************************************************/

    var BilliardBallModel = {};
    
    BilliardBallModel.DEFAULT_RADIUS = 30;
    BilliardBallModel.MIN_DEFLECTION_ANGLE = 120 * DEG_TO_RAD;
    BilliardBallModel.MAX_DEFLECTION_ANGLE = 170 * DEG_TO_RAD;
    BilliardBallModel.DEFLECTION_ANGLE_RANGE = range({ min: BilliardBallModel.MIN_DEFLECTION_ANGLE, max: BilliardBallModel.MAX_DEFLECTION_ANGLE });
    
    Constants.BilliardBallModel = BilliardBallModel;


    /*************************************************************************
     **                                                                     **
     **                         PLUM PUDDING MODEL                          **
     **                                                                     **
     *************************************************************************/

    var PlumPuddingModel = {};
    
    // default radius of the atom, tweaked to match PlumPuddingNode image
    PlumPuddingModel.DEFAULT_RADIUS = 30;
    // maximum number of photons that can be absorbed
    PlumPuddingModel.MAX_PHOTONS_ABSORBED = 1; //WARNING: Untested with values != 1
    // wavelength of emitted photons
    PlumPuddingModel.PHOTON_EMISSION_WAVELENGTH = 150; // nm
    // probability that photon will be emitted
    PlumPuddingModel.PHOTON_EMISSION_PROBABILITY = 0.1; // 1.0 = 100%
    // probability that photon will be absorbed
    PlumPuddingModel.PHOTON_ABSORPTION_PROBABILITY = 0.5; // 1.0 = 100%
    // number of discrete steps in the electron line
    PlumPuddingModel.ELECTRON_LINE_SEGMENTS = 30;
    
    Constants.PlumPuddingModel = PlumPuddingModel;


    /*************************************************************************
     **                                                                     **
     **                         SOLAR SYSTEM MODEL                          **
     **                                                                     **
     *************************************************************************/

    var SolarSystemModel = {};
    
    /*
     * NOTE! Tweak these VERY carefully, and test often! 
     * They must be set so that the atom is destroyed before 
     * any photons or alpha particles reach it.
     */
    
    // initial distance between electron and proton
    SolarSystemModel.ELECTRON_DISTANCE = 150;
    // amount the distance between the proton and electron is reduce per dt
    SolarSystemModel.ELECTRON_DISTANCE_DELTA = 4;
    // any distance smaller than this is effectively zero
    SolarSystemModel.MIN_ELECTRON_DISTANCE = 5;
    // change in electron's rotation angle per dt
    SolarSystemModel.ELECTRON_ANGLE_DELTA = 16 * DEG_TO_RAD;
    // scaling of electron's rotation delta
    SolarSystemModel.ELECTRON_ACCELERATION = 1.008;
    
    Constants.SolarSystemModel = SolarSystemModel;


    /*************************************************************************
     **                                                                     **
     **                              BOHR MODEL                             **
     **                                                                     **
     *************************************************************************/

    var BohrModel = {};

    // used to turn off aspects of this model from the Developer Controls dialog
    BohrModel.DEBUG_ABSORPTION_ENABLED = true;
    BohrModel.DEBUG_SPONTANEOUS_EMISSION_ENABLED = true;
    BohrModel.DEBUG_STIMULATED_EMISSION_ENABLED = true; 
    // enabled debugging output
    BohrModel.DEBUG_OUTPUT_ENABLED = false;

    // minimum time (simulation clock time) that electron stays in a state before emission can occur
    BohrModel.MIN_TIME_IN_STATE = 50;
    // Radius of each orbit supported by this model, these are distorted to fit in the box!
    BohrModel.ORBIT_RADII = [ 15, 44, 81, 124, 174, 233 ];
    // probability that photon will be absorbed
    BohrModel.PHOTON_ABSORPTION_PROBABILITY = 1.0; // 1.0 = 100%
    // probability that photon will cause stimulated emission
    BohrModel.PHOTON_STIMULATED_EMISSION_PROBABILITY = BohrModel.PHOTON_ABSORPTION_PROBABILITY;
    // probability that photon will be emitted
    BohrModel.PHOTON_SPONTANEOUS_EMISSION_PROBABILITY = 0.5; // 1.0 = 100%
    // change in orbit angle per dt for ground state orbit
    BohrModel.ELECTRON_ANGLE_DELTA = 10 * DEG_TO_RAD;
    // wavelengths must be less than this close to be considered equal
    BohrModel.WAVELENGTH_CLOSENESS_THRESHOLD = 0.5;
    // How close an emitted photon is placed to the photon that causes stimulated emission
    BohrModel.STIMULATED_EMISSION_X_OFFSET = 10;

    Constants.BohrModel = BohrModel;


    /*************************************************************************
     **                                                                     **
     **                           DeBROGLIE MODEL                           **
     **                                                                     **
     *************************************************************************/

    var DeBroglieModel = {};

    DeBroglieModel.ORBIT_Y_SCALE = 0.35;

    Constants.DeBroglieModel = DeBroglieModel;


    /*************************************************************************
     **                                                                     **
     **                          SCHRÖDINGER MODEL                          **
     **                                                                     **
     *************************************************************************/

    var SchroedingerModel = {};

    SchroedingerModel.DEBUG_STATE_TRANSITIONS = false;
    SchroedingerModel.DEBUG_REJECTED_TRANSITIONS = false;
    /*
     * This table defines the transition strengths for the primary state component (n).
     * Some of the entries in this table are non-sensical, but their strengths are 
     * zero and it helps to have a symmetrical table.  This table was taken from
     * the simulation design document.
     * 
     * Here's an example that shows how the table is indexed:
     * TRANSITION_STRENGTH[5][0] is the transition strength from n=6 to n=1
     */
    SchroedingerModel.TRANSITION_STRENGTH = [
        [  0,    0,    0,    0,    0 ],
        [ 12.53, 0,    0,    0,    0 ],
        [  3.34, 0.87, 0,    0,    0 ],
        [  1.36, 0.24, 0.07, 0,    0 ],
        [  0.69, 0.11, 0,    0.04, 0 ],
        [  0.39, 0.06, 0.02, 0,    0 ]
    ];

    Constants.SchroedingerModel = SchroedingerModel;


    /*************************************************************************
     **                                                                     **
     **                              GUN MODEL                              **
     **                                                                     **
     *************************************************************************/

    var Gun = {};

    Gun.MODE_PHOTONS = 2;
    Gun.MODE_ALPHA_PARTICLES = 1;

    Gun.LIGHT_WHITE = 0;
    Gun.LIGHT_MONOCHROME = 1;

    Gun.DEFAULT_MODE = Gun.MODE_PHOTONS;
    Gun.DEFAULT_LIGHT_TYPE = Gun.LIGHT_WHITE;
    Gun.DEFAULT_WAVELENGTH = 94;
    Gun.DEFAULT_LIGHT_INTENSITY = 1;
    Gun.DEFAULT_ALPHA_PARTICLE_INTENSITY = 1;
    // probability that a "white light" photon's wavelength will one that causes a state transition
    Gun.TRANSITION_WAVELENGTHS_WEIGHT = 0.40; // 1.0 = 100%
    // probability that the gun will fire from it's center
    Gun.CENTER_FIRE_PROBABILITY = 0.10; // 1.0 = 100%

    Constants.Gun = Gun;


    /*************************************************************************
     **                                                                     **
     **                          METASTABLE HANDLER                         **
     **                                                                     **
     *************************************************************************/

    var MetastableHandler = {};

    // metastable state is (n,l,m) = (2,0,0)
    MetastableHandler.METASTABLE_N = 2;
    MetastableHandler.METASTABLE_L = 0;
    MetastableHandler.METASTABLE_M = 0;
    /*
     * When the atom has been in the metastable state for this amount of
     * simulation time, we will fire an absorbable photon at its center.
     * This is public and non-final because it can be adjusted using a developer control.
     */
    MetastableHandler.MAX_STUCK_TIME = 100; // dt

    Constants.MetastableHandler = MetastableHandler;

    

    /*************************************************************************
     **                                                                     **
     **                      DeBROGLIE BRIGHTNESS VIEW                      **
     **                                                                     **
     *************************************************************************/

    var DeBroglieModelBrightnessSubView = {};

    // Radial width of the ring representation
    DeBroglieModelBrightnessSubView.RING_WIDTH = 5;
    DeBroglieModelBrightnessSubView.SEGMENT_LENGTH = 2;

    // color used when amplitude = +1
    DeBroglieModelBrightnessSubView.PLUS_COLOR = Constants.ELECTRON_COLOR;
    // color used when amplitude = -1
    DeBroglieModelBrightnessSubView.MINUS_COLOR = '#000';
    // color used when amplitude = 0
    DeBroglieModelBrightnessSubView.ZERO_COLOR = Colors.interpolateHex(
        DeBroglieModelBrightnessSubView.MINUS_COLOR, 
        DeBroglieModelBrightnessSubView.PLUS_COLOR, 
        0.5
    );

    Constants.DeBroglieModelBrightnessSubView = DeBroglieModelBrightnessSubView;


    /*************************************************************************
     **                                                                     **
     **                   DeBROGLIE RADIAL DISTANCE VIEW                    **
     **                                                                     **
     *************************************************************************/

    var DeBroglieModelRadialSubView = {};

    // Multiply the ground state orbit radius by this number to determine max amplitude
    DeBroglieModelRadialSubView.RADIAL_OFFSET_FACTOR = 0.45;
    // Number of line segments used to approximate the ring
    DeBroglieModelRadialSubView.NUMBER_OF_SEGMENTS = 128;

    Constants.DeBroglieModelRadialSubView = DeBroglieModelRadialSubView;


    /*************************************************************************
     **                                                                     **
     **                      DeBROGLIE HEIGHT 3D VIEW                       **
     **                                                                     **
     *************************************************************************/

    var DeBroglieModel3DSubView = {};

    // How much to scale the orbit in the y dimension, in order to 
    //   create an ellipse that represents the projection of the 3D orbit into 3D.
    //   See debugOrbitProjections method.
    //   If you change this value, you must also change FINAL_VIEW_ANGLE !!
    DeBroglieModel3DSubView.ORBIT_Y_SCALE = DeBroglieModel.ORBIT_Y_SCALE;
    // Setting this to true cause the wireframe to rotate into place
    DeBroglieModel3DSubView.ROTATE_INTO_PLACE = true;
    DeBroglieModel3DSubView.MAX_HEIGHT = 15; // screen coordinates
    // The final view angle, after the model has rotated into place.
    // If you change this value, you must also change ORBIT_Y_SCALE !!
    DeBroglieModel3DSubView.FINAL_VIEW_ANGLE = 70; // degrees, rotation about the x-axis
    // change is angle during view animation
    DeBroglieModel3DSubView.VIEW_ANGLE_DELTA = 5; // degrees
    
    // DeBroglieModel3DSubView.ORBIT_VERTICIES = 200;
    // DeBroglieModel3DSubView.ORBIT_LINE_WIDTH = 1;
    // DeBroglieModel3DSubView.ORBIT_FRONT_COLOR = '#fff';
    // DeBroglieModel3DSubView.ORBIT_BACK_COLOR = '#eee';
    
    DeBroglieModel3DSubView.WAVE_VERTICIES = 200;
    DeBroglieModel3DSubView.WAVE_LINE_WIDTH = 2;
    DeBroglieModel3DSubView.WAVE_COLOR = Constants.ELECTRON_COLOR;

    Constants.DeBroglieModel3DSubView = DeBroglieModel3DSubView;


    /*************************************************************************
     **                                                                     **
     **                       SCHRÖDINGER MODEL VIEW                        **
     **                                                                     **
     *************************************************************************/

    var SchroedingerModelView = {};

    // Animation box dimensions, for convenience
    SchroedingerModelView.BOX_WIDTH = Constants.ANIMATION_BOX_SIZE.width;
    SchroedingerModelView.BOX_HEIGHT = Constants.ANIMATION_BOX_SIZE.height;
        
    // Resolution of the grid, which covers 1/8 of the 3D space
    SchroedingerModelView.NUMBER_OF_HORIZONTAL_CELLS = 40;
    SchroedingerModelView.NUMBER_OF_VERTICAL_CELLS = SchroedingerModelView.NUMBER_OF_HORIZONTAL_CELLS;
    SchroedingerModelView.NUMBER_OF_DEPTH_CELLS = SchroedingerModelView.NUMBER_OF_HORIZONTAL_CELLS;
    
    // 3D cell size
    SchroedingerModelView.CELL_WIDTH  = (Constants.ANIMATION_BOX_SIZE.width  / SchroedingerModelView.NUMBER_OF_HORIZONTAL_CELLS) / 2;
    SchroedingerModelView.CELL_HEIGHT = (Constants.ANIMATION_BOX_SIZE.height / SchroedingerModelView.NUMBER_OF_VERTICAL_CELLS) / 2;
    SchroedingerModelView.CELL_DEPTH  = (Constants.ANIMATION_BOX_SIZE.height / SchroedingerModelView.NUMBER_OF_DEPTH_CELLS) / 2;
    
    // colors used to represent probability density -- MUST BE OPAQUE!
    SchroedingerModelView.MAX_RGBA = Colors.hexToRgb('#00C9FF'/*Constants.ELECTRON_COLOR*/);
    SchroedingerModelView.MAX_RGBA.a = 255;
    SchroedingerModelView.MIN_RGBA = Colors.hexToRgb('#000');
    SchroedingerModelView.MIN_RGBA.a = 0;
        
    // margin between axes and animation box
    SchroedingerModelView.AXES_MARGIN = 20;
    SchroedingerModelView.HORIZONTAL_AXIS_LABEL = "x";
    SchroedingerModelView.VERTICAL_AXIS_LABEL = "z";
    
    // margin between the state display and animation box
    SchroedingerModelView.STATE_MARGIN = 15;
    
    // Cache of brightness values for all possible states
    SchroedingerModelView.BRIGHTNESS_CACHE;
    
    // Should the brightness cache be fully populated the first time we visit Schrodinger?
    // DANGER! Fully populating the cache can take ~15 seconds!
    SchroedingerModelView.POPULATE_CACHE = false;

    Constants.SchroedingerModelView = SchroedingerModelView;


    return Constants;
});
