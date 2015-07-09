define(function (require) {

    'use strict';

    var range   = require('common/math/range');
    var Vector2 = require('common/math/vector2');

    var DEG_TO_RAD = Math.PI / 180;

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.EPSILON_0 = 8.854E-12; // vacuum permittivity, aka electric constant (Farads/meter)

    // world
    Constants.WORLD_DRAG_MARGIN = 0.001; // meters

    // battery
    Constants.BATTERY_VOLTAGE_RANGE = range({ min: -1.5, max: 1.5, defaultValue: 0 }); // Volts
    Constants.BATTERY_VOLTAGE_SNAP_TO_ZERO_THRESHOLD = 0.1; // Volts

    // capacitor
    Constants.PLATE_WIDTH_RANGE = range({ min: 0.01, max: 0.02, defaultValue: 0.01 }); // meters
    Constants.PLATE_HEIGHT = 0.0005; // meters
    Constants.PLATE_SEPARATION_RANGE = range({ min: 0.005, max: 0.01, defaultValue: 0.01 }); // meters
    Constants.CAPACITANCE_RANGE = range({ min: 1E-13, max: 3E-13 }); // Farads

    // dielectric
    Constants.DIELECTRIC_CONSTANT_RANGE = range({ min: 1, max: 5, defaultValue: 5 }); // dimensionless
    Constants.DIELECTRIC_OFFSET_RANGE = range({ min: 0, max: Constants.PLATE_WIDTH_RANGE.max, defaultValue: Constants.PLATE_WIDTH_RANGE.defaultValue }); // meters

    // dielectric constants (dimensionless)
    Constants.EPSILON_VACUUM = 1;
    Constants.EPSILON_GLASS  = 4.7;
    Constants.EPSILON_PAPER  = 3.5;
    Constants.EPSILON_TEFLON = 2.1;

    /*
     * Original note from PhET:
     *   The dielectric constant of air is actually 1.0005896. The model for this sim specified that
     *   the circuit was in air.  But we discovered late in the development of this sim that we should
     *   have modeled the circuit in a vacuum, because we want the E-Field component due to the
     *   environment to be zero.  With air, we have a small Dielectric vector of up to 4 V/m shown
     *   on the E-Field Detector when the Plate Charge control is set to its maximum.
     *  
     *   Rather than change "air" to "vacuum" in numerous places throughout the code and design doc,
     *   it was suggested that we simply set the dielectric constant of air to 1.0.  I was hesitant to
     *   do this, since I think it's going to cause future problems.  But Kathy P. bet me a 6-pack of
     *   beer that it will never be a problem.  Any developer who needs to change this in the future
     *   is hereby bound by the Developer Code of Ethics to inform me, so that I can collect on
     *   this wager.
     *
     *                                                         - Chris Malley (cmalley@pixelzoom.com)
     */
    Constants.EPSILON_AIR = 1.0;

    // Wire
    Constants.WIRE_THICKNESS = 0.0005; // meters

    // Plate Charge control
    Constants.PLATE_CHARGE_CONTROL_SNAP_TO_ZERO_THRESHOLD = 1.5E-13;

    //----------------------------------------------------------------------------
    // View
    //----------------------------------------------------------------------------

    // reference coordinate frame size for world nodes
    Constants.CANVAS_RENDERING_SIZE = new Vector2( 1024, 864 );

    // model-view transform
    Constants.MVT_SCALE = 15000; // scale factor when going from model to view
    Constants.MVT_YAW   = -45 * DEG_TO_RAD; // rotation about the vertical axis, right-hand rule determines sign
    Constants.MVT_PITCH =  30 * DEG_TO_RAD; // rotation about the horizontal axis, right-hand rule determines sign

    Constants.DRAG_HANDLE_ARROW_LENGTH = 35; // pixels

    // default exponents for the meters
    Constants.CAPACITANCE_METER_VALUE_EXPONENT = -12;
    Constants.PLATE_CHARGE_METER_VALUE_EXPONENT = -13;
    Constants.STORED_ENERGY_METER_VALUE_EXPONENT = -13;

    // plate charges
    Constants.NUMBER_OF_PLATE_CHARGES = new range({ min: 1, max: 625 });
    Constants.NEGATIVE_CHARGE_SIZE = new Vector2( 7, 2 );
    Constants.PLATE_CHARGES_VISIBLE = true;

    // dielectric charges
    //Constants.DIELECTRIC_CHARGE_VIEW = DielectricChargeView.TOTAL;

    // E-field
    Constants.NUMBER_OF_EFIELD_LINES = new range({ min: 4, max: 900 }); // number of lines on smallest plate
    Constants.EFIELD_VISIBLE = false;

    // capacitance control
    Constants.CAPACITANCE_CONTROL_EXPONENT = -13;




    return Constants;
});
