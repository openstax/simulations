define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/
    
    //----------------------------------------------------------------------------
    // Clock parameters
    //----------------------------------------------------------------------------
    
    Constants.CLOCK_STEP = 1; // clock ticks
    Constants.CLOCK_FRAME_RATE = 25;  // frames per second
    Constants.CLOCK_DELAY = ( 1000 / Constants.CLOCK_FRAME_RATE ); // milliseconds
    Constants.CLOCK_TIME_STEP_IS_CONSTANT = true;
    Constants.CLOCK_ENABLE_CONTROLS = true;

    //----------------------------------------------------------------------------
    // Bar Magnet parameters
    //----------------------------------------------------------------------------
    
    Constants.BAR_MAGNET_WIDTH = 250;
    Constants.BAR_MAGNET_HEIGHT = 50;
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



    return Constants;
});
