define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var Dimension = function(width, height) {
        this.width = width;
        this.height = height;
    };

    var DEG_TO_RAD = Math.PI / 180;


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SCENE_WIDTH  = 800;
    Constants.SCENE_HEIGHT = 640; // Changed from 600 to account for playback controls panel
    
    //----------------------------------------------------------------------------
    // Clock parameters
    //----------------------------------------------------------------------------
    
    Constants.CLOCK_STEP = 1; // clock ticks
    Constants.CLOCK_FRAME_RATE = 25;  // frames per second
    Constants.CLOCK_DELAY = (1000 / Constants.CLOCK_FRAME_RATE); // milliseconds
    Constants.CLOCK_TIME_STEP_IS_CONSTANT = true;
    Constants.CLOCK_ENABLE_CONTROLS = true;

    //----------------------------------------------------------------------------
    // Bar Magnet parameters
    //----------------------------------------------------------------------------
    
    Constants.BAR_MAGNET_SIZE = new Dimension(250, 50);
    Constants.BAR_MAGNET_STRENGTH_MAX = 300; // Gauss
    Constants.BAR_MAGNET_STRENGTH_MIN = 0; // Gauss

    //----------------------------------------------------------------------------
    // Electromagnet parameters
    //----------------------------------------------------------------------------
    
    Constants.ELECTROMAGNET_STRENGTH_MAX = 300; // Gauss
    Constants.ELECTROMAGNET_LOOPS_MAX = 4;
    Constants.ELECTROMAGNET_LOOPS_MIN = 1;
    Constants.ELECTROMAGNET_WIRE_WIDTH = 20;
    
    //----------------------------------------------------------------------------
    // Turbine parameters
    //----------------------------------------------------------------------------
    
    Constants.TURBINE_STRENGTH_MAX = 300; // Gauss
    Constants.TURBINE_STRENGTH_MIN = 0; // Gauss;
    
    //----------------------------------------------------------------------------
    // B-field (grid of compass needles) parameters
    //----------------------------------------------------------------------------
    
    Constants.GRID_INTENSITY_SCALE_MIN = 1;
    Constants.GRID_INTENSITY_SCALE_MAX = 6;
    Constants.GRID_INTENSITY_SCALE = 2.7;
    
    Constants.GRID_SPACING_MAX = 100;
    Constants.GRID_SPACING_MIN = 35;
    Constants.GRID_SPACING = 40;
    
    Constants.GRID_NEEDLE_ASPECT_RATIO = 25 / 7; // tips:waist
    
    Constants.GRID_NEEDLE_WIDTH_MAX = 60;
    Constants.GRID_NEEDLE_WIDTH_MIN = 20;
    Constants.GRID_NEEDLE_WIDTH = 25;
    Constants.GRID_NEEDLE_HEIGHT = parseInt(Constants.GRID_NEEDLE_WIDTH / Constants.GRID_NEEDLE_ASPECT_RATIO);
    
    Constants.NORTH_COLOR = '#f00';
    Constants.SOUTH_COLOR = '#fff';
    
    //----------------------------------------------------------------------------
    // Pickup Coil parameters
    //----------------------------------------------------------------------------
    
    Constants.MAX_PICKUP_LOOPS = 3;
    Constants.MIN_PICKUP_LOOPS = 1;
    
    var MAX_PICKUP_LOOP_RADIUS = 150.0;
    var MIN_PICKUP_LOOP_RADIUS = 68.0;
    Constants.MIN_PICKUP_LOOP_RADIUS = MIN_PICKUP_LOOP_RADIUS;
    
    Constants.MAX_PICKUP_LOOP_AREA = Math.PI * MAX_PICKUP_LOOP_RADIUS * MAX_PICKUP_LOOP_RADIUS;
    Constants.MIN_PICKUP_LOOP_AREA = Math.PI * MIN_PICKUP_LOOP_RADIUS * MIN_PICKUP_LOOP_RADIUS;
    Constants.DEFAULT_PICKUP_LOOP_AREA = Constants.MAX_PICKUP_LOOP_AREA / 2; 
    
    //----------------------------------------------------------------------------
    // Battery parameters 
    //----------------------------------------------------------------------------
    
    Constants.BATTERY_VOLTAGE_MAX = 10;  // volts
    
    Constants.BATTERY_AMPLITUDE_MAX = 1.0; // -1...1
    Constants.BATTERY_AMPLITUDE_MIN = -1.0; // -1...1

    //----------------------------------------------------------------------------
    // AC Power Supply parameters
    //----------------------------------------------------------------------------
    
    Constants.AC_VOLTAGE_MAX = 110.0;  // volts
    
    Constants.AC_MAXAMPLITUDE_MAX = 1.0;  // 0...1
    Constants.AC_MAXAMPLITUDE_MIN = 0.0;  // 0...1
    
    Constants.AC_FREQUENCY_MAX = 1.0;  // 0...1
    Constants.AC_FREQUENCY_MIN = 0.05;  // 0...1

    //----------------------------------------------------------------------------
    // Thresholds
    //----------------------------------------------------------------------------
    
    /* B-field needles with magnitude below this value are not drawn. */
    Constants.GRID_BFIELD_THRESHOLD = 0.02; // Gauss
    
    /* Absolute current amplitude below this value is treated as zero. */
    Constants.CURRENT_AMPLITUDE_THRESHOLD = 0.001;
    
    //----------------------------------------------------------------------------
    // Developer controls
    //----------------------------------------------------------------------------
    
    Constants.PICKUP_CALIBRATION_EMF_MIN = 1E4;
    Constants.PICKUP_CALIBRATION_EMF_MAX = 5E6;
    
    Constants.PICKUP_ELECTRONS_SPEED_SCALE_MIN = 1;
    Constants.PICKUP_ELECTRONS_SPEED_SCALE_MAX = 100;
    
    Constants.PICKUP_TRANSITION_SMOOTHING_SCALE_MIN = 0.1; // must be > 0
    Constants.PICKUP_TRANSITION_SMOOTHING_SCALE_MAX = 1; // must be <= 1
    
    Constants.LIGHTBULB_GLASS_GLOW_SCALE_MIN = 1;
    Constants.LIGHTBULB_GLASS_GLOW_SCALE_MAX = 100;


    /*************************************************************************
     **                                                                     **
     **                        BAR MAGNET SIMULATION                        **
     **                                                                     **
     *************************************************************************/

    var BarMagnetSimulation = {};

    // Rendering layers
    BarMagnetSimulation.B_FIELD_LAYER     = 1;
    BarMagnetSimulation.BAR_MAGNET_LAYER  = 2;
    BarMagnetSimulation.COMPASS_LAYER     = 3;
    BarMagnetSimulation.FIELD_METER_LAYER = 4;
    BarMagnetSimulation.EARTH_LAYER       = 5;

    // Locations
    BarMagnetSimulation.BAR_MAGNET_LOCATION  = new Vector2(450, 300);
    BarMagnetSimulation.COMPASS_LOCATION     = new Vector2(150, 300);
    BarMagnetSimulation.FIELD_METER_LOCATION = new Vector2(150, 400);
    BarMagnetSimulation.WIGGLE_ME_LOCATION   = new Vector2(250, 175);

    // Bar Magnet
    BarMagnetSimulation.BAR_MAGNET_SIZE = Constants.BAR_MAGNET_SIZE;
    BarMagnetSimulation.BAR_MAGNET_STRENGTH = 0.75 * Constants.BAR_MAGNET_STRENGTH_MAX;
    BarMagnetSimulation.BAR_MAGNET_DIRECTION = 0.0; // radians

    Constants.BarMagnetSimulation = BarMagnetSimulation;


    /*************************************************************************
     **                                                                     **
     **                        PICKUP COIL SIMULATION                       **
     **                                                                     **
     *************************************************************************/

    var PickupCoilSimulation = {};

    // Locations
    PickupCoilSimulation.BAR_MAGNET_LOCATION  = new Vector2( 200, 400 );
    PickupCoilSimulation.PICKUP_COIL_LOCATION = new Vector2( 500, 400 );
    PickupCoilSimulation.COMPASS_LOCATION     = new Vector2( 100, 525 );
    PickupCoilSimulation.FIELD_METER_LOCATION = new Vector2( 150, 400 );

    // Bar Magnet
    PickupCoilSimulation.BAR_MAGNET_SIZE = Constants.BAR_MAGNET_SIZE;
    PickupCoilSimulation.BAR_MAGNET_STRENGTH = 0.75 * Constants.BAR_MAGNET_STRENGTH_MAX;
    PickupCoilSimulation.BAR_MAGNET_DIRECTION = 0.0; // radians

    // Pickup Coil parameters
    PickupCoilSimulation.PICKUP_COIL_NUMBER_OF_LOOPS = 2;
    PickupCoilSimulation.PICKUP_COIL_LOOP_AREA = Constants.DEFAULT_PICKUP_LOOP_AREA;
    PickupCoilSimulation.PICKUP_COIL_DIRECTION = 0.0; // radians
    PickupCoilSimulation.PICKUP_COIL_TRANSITION_SMOOTHING_SCALE = 0.77; // see PickupCoil.setTransitionSmoothingScale

    // Scaling
    PickupCoilSimulation.CALIBRATION_EMF = 2700000; // see PickupCoil.calibrateEmf for calibration instructions
    PickupCoilSimulation.ELECTRON_SPEED_SCALE = 3.0;

    Constants.PickupCoilSimulation = PickupCoilSimulation;


    

    /*************************************************************************
     **                                                                     **
     **                              BAR MAGNET                             **
     **                                                                     **
     *************************************************************************/

    var BarMagnet = {};

    // values used in MathCAD for generating the grid files
    BarMagnet.GRID_MAGNET_STRENGTH       =  1; // strength of the magnet, in Gauss
    BarMagnet.INTERNAL_GRID_SPACING      =  5; // spacing between points in the internal grid, same in both dimensions
    BarMagnet.EXTERNAL_NEAR_GRID_SPACING =  5; // spacing between points in the external-near grid, same in both dimensions
    BarMagnet.EXTERNAL_FAR_GRID_SPACING  = 20; // spacing between points in the external-far grid, same in both dimensions
    BarMagnet.INTERNAL_GRID_SIZE      = new Dimension(26,   6); // number of points in the internal grid
    BarMagnet.EXTERNAL_NEAR_GRID_SIZE = new Dimension(101, 81); // number of points in the external-near grid
    BarMagnet.EXTERNAL_FAR_GRID_SIZE  = new Dimension(126, 61); // number of points in the external-far grid

    BarMagnet.BX_INTERNAL      = require('text!models/bfield/BX_internal.csv');
    BarMagnet.BY_INTERNAL      = require('text!models/bfield/BY_internal.csv');
    BarMagnet.BX_EXTERNAL_NEAR = require('text!models/bfield/BX_external_near.csv');
    BarMagnet.BY_EXTERNAL_NEAR = require('text!models/bfield/BY_external_near.csv');
    BarMagnet.BX_EXTERNAL_FAR  = require('text!models/bfield/BX_external_far.csv');
    BarMagnet.BY_EXTERNAL_FAR  = require('text!models/bfield/BY_external_far.csv');

    Constants.BarMagnet = BarMagnet;


    /*************************************************************************
     **                                                                     **
     **                           AC POWER SUPPLY                           **
     **                                                                     **
     *************************************************************************/

    var ACPowerSupply = {};

    // The minimum number of steps used to approximate one sine wave cycle.
    ACPowerSupply.MIN_STEPS_PER_CYCLE = 10;

    Constants.ACPowerSupply = ACPowerSupply;


    /*************************************************************************
     **                                                                     **
     **                               COMPASS                               **
     **                                                                     **
     *************************************************************************/

    var Compass = {};

    // Public interface for specifying behavior.
    Compass.SIMPLE_BEHAVIOR      = 0; // see SimpleBehavior
    Compass.INCREMENTAL_BEHAVIOR = 1; // see IncrementalBehavior
    Compass.KINEMATIC_BEHAVIOR   = 2; // see KinematicBehavior

    Constants.Compass = Compass;


    /*************************************************************************
     **                                                                     **
     **                              VOLTMETER                              **
     **                                                                     **
     *************************************************************************/

    var Voltmeter = {};

    // Define the zero point of the needle.
    Voltmeter.ZERO_NEEDLE_ANGLE = 0.0 * DEG_TO_RAD;
    // The needle deflection range is this much on either side of the zero point.
    Voltmeter.MAX_NEEDLE_ANGLE = 90.0 * DEG_TO_RAD;
    // If rotational kinematics is enabled, the needle will jiggle this much around the zero reading.
    Voltmeter.NEEDLE_JIGGLE_ANGLE = 3.0 * DEG_TO_RAD;
    // When the angle is this close to zero, the needle stops jiggling.
    Voltmeter.NEEDLE_JIGGLE_THRESHOLD = 0.5 * DEG_TO_RAD;
    /*
     * Determines how much the needle jiggles around the zero point.
     * The value L should be such that 0 < L < 1.
     * If set to 0, the needle will not jiggle at all.
     * If set to 1, the needle will ocsillate forever.
     */
    Voltmeter.NEEDLE_LIVELINESS = 0.6;

    Constants.Voltmeter = Voltmeter;


    /*************************************************************************
     **                                                                     **
     **                               ELECTRON                              **
     **                                                                     **
     *************************************************************************/

    var Electron = {};

    // Maximum distance along a path that can be traveled in one clock tick.
    Electron.MAX_PATH_POSITION_DELTA = 0.15;

    Constants.Electron = Electron;


    /*************************************************************************
     **                                                                     **
     **                       ELECTRON PATH DESCRIPTOR                      **
     **                                                                     **
     *************************************************************************/

    var ElectronPathDescriptor = {};

    // The default speed scale
    ElectronPathDescriptor.DEFAULT_SPEED_SCALE = 1.0;
    // Curve is part of the foreground layer
    ElectronPathDescriptor.FOREGROUND = 0;
    // Curve is part of the background layer
    ElectronPathDescriptor.BACKGROUND = 1;

    Constants.ElectronPathDescriptor = ElectronPathDescriptor;


    /*************************************************************************
     **                                                                     **
     **                             COMPASS VIEW                            **
     **                                                                     **
     *************************************************************************/

    var CompassView = {};

    CompassView.RING_DIAMETER      = 80; // In sim units, outer diameter, including stroke
    CompassView.RING_STROKE_WIDTH  = 10; // In sim units
    CompassView.INDICATOR_DIAMETER =  6; // In sim units
    CompassView.ANCHOR_DIAMETER    =  6; // In sim units
    CompassView.NEEDLE_WIDTH       = 55; // In sim units
    CompassView.RING_COLOR = '#999';
    CompassView.LENS_COLOR = '#fff';
    CompassView.LENS_ALPHA = 0.15;
    CompassView.INDICATOR_COLOR = '#000';
    CompassView.ANCHOR_COLOR = '#000';
    CompassView.INDICATOR_INCREMENT = Math.PI / 4; // Radians

    Constants.CompassView = CompassView;


    /*************************************************************************
     **                                                                     **
     **                              BFIELD VIEW                            **
     **                                                                     **
     *************************************************************************/

    var BFieldInsideView = {};

    BFieldInsideView.X_SPACING = 34;
    BFieldInsideView.Y_SPACING = 20;
    BFieldInsideView.COLUMNS = 7; // this must be an odd number!

    Constants.BFieldInsideView = BFieldInsideView;


    /*************************************************************************
     **                                                                     **
     **                           FIELD METER VIEW                          **
     **                                                                     **
     *************************************************************************/

    var FieldMeterView = {};

    FieldMeterView.PANEL_COLOR = '#ededed';

    Constants.FieldMeterView = FieldMeterView;


    return Constants;
});
