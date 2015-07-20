define(function (require) {

    'use strict';

    var range   = require('common/math/range');
    var Vector2 = require('common/math/vector2');
    var Vector3 = require('common/math/vector3');

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


    /*************************************************************************
     **                                                                     **
     **                        DIELECTRIC SIMULATION                        **
     **                                                                     **
     *************************************************************************/

    var DielectricSimulation = {};

    // Circuit
    DielectricSimulation.BATTERY_LOCATION = new Vector3(0.005, 0.034, 0); // meters
    DielectricSimulation.BATTERY_CONNECTED = true;
    DielectricSimulation.CAPACITOR_X_SPACING = 0.025; // meters
    DielectricSimulation.CAPACITOR_Y_SPACING = 0; // meters
    DielectricSimulation.PLATE_WIDTH = Constants.PLATE_WIDTH_RANGE.defaultValue;
    DielectricSimulation.PLATE_SEPARATION = Constants.PLATE_SEPARATION_RANGE.defaultValue;
    DielectricSimulation.WIRE_THICKNESS = Constants.WIRE_THICKNESS;
    DielectricSimulation.WIRE_EXTENT = 0.016; // how far the wire extends above or below the capacitor (meters)

    // Capacitance meter
    DielectricSimulation.CAPACITANCE_METER_LOCATION = new Vector3(0.038, 0.0017, 0);
    DielectricSimulation.CAPACITANCE_METER_VISIBLE = false;

    // Plate Charge meter
    DielectricSimulation.PLATE_CHARGE_METER_LOCATION = new Vector3(0.049, 0.0017, 0);
    DielectricSimulation.PLATE_CHARGE_METER_VISIBLE = false;

    // Stored Energy meter
    DielectricSimulation.STORED_ENERGY_METER_LOCATION = new Vector3(0.06, 0.0017, 0);
    DielectricSimulation.STORED_ENERGY_METER_VISIBLE = false;

    // E-Field Detector
    DielectricSimulation.EFIELD_DETECTOR_BODY_LOCATION = new Vector3(0.043, 0.041, 0);
    DielectricSimulation.EFIELD_DETECTOR_PROBE_LOCATION = DielectricSimulation.BATTERY_LOCATION;
    DielectricSimulation.EFIELD_DETECTOR_VISIBLE = false;
    DielectricSimulation.EFIELD_PLATE_VECTOR_VISIBLE = true;
    DielectricSimulation.EFIELD_DIELECTRIC_VECTOR_VISIBLE = true;
    DielectricSimulation.EFIELD_SUM_VECTOR_VISIBLE = true;
    DielectricSimulation.EFIELD_VALUES_VISIBLE = true;

    // Voltmeter
    var batteryLoc = DielectricSimulation.BATTERY_LOCATION;
    var positiveProbeLocation = new Vector3(batteryLoc.x + 0.015, batteryLoc.y, batteryLoc.z);
    var negativeProbeLocation = new Vector3(positiveProbeLocation.x + 0.005, positiveProbeLocation.y, positiveProbeLocation.z);
    DielectricSimulation.VOLTMETER_BODY_LOCATION = new Vector3(0.057, 0.023, 0);
    DielectricSimulation.VOLTMETER_POSITIVE_PROBE_LOCATION = positiveProbeLocation;
    DielectricSimulation.VOLTMETER_NEGATIVE_PROBE_LOCATION = negativeProbeLocation;
    DielectricSimulation.VOLTMETER_VISIBLE = false;

    Constants.DielectricSimulation = DielectricSimulation;


    /*************************************************************************
     **                                                                     **
     **                        DIELECTRIC SIMULATION                        **
     **                                                                     **
     *************************************************************************/

    var MultipleCapacitorsSimulation = {};

    MultipleCapacitorsSimulation.BATTERY_LOCATION = new Vector3(0.005, 0.030, 0); // meters
    MultipleCapacitorsSimulation.CAPACITOR_X_SPACING = 0.018; // meters
    MultipleCapacitorsSimulation.CAPACITOR_Y_SPACING = 0.016; // meters
    MultipleCapacitorsSimulation.DIELECTRIC_OFFSET = 0;
    MultipleCapacitorsSimulation.PLATE_WIDTH = 0.0075; // meters
    MultipleCapacitorsSimulation.WIRE_THICKNESS = Constants.WIRE_THICKNESS;
    MultipleCapacitorsSimulation.WIRE_EXTENT = 0.01; // how far a wire extends above or below topmost capacitor's origin, in meters

    Constants.MultipleCapacitorsSimulation = MultipleCapacitorsSimulation;


    /*************************************************************************
     **                                                                     **
     **                               BATTERY                               **
     **                                                                     **
     *************************************************************************/

    var Battery = {};

    // size of the associated image file, determined by visual inspection
    Battery.BODY_WIDTH  = 0.0065;  // Meters
    Battery.BODY_HEIGHT = 0.01425; // Meters
    Battery.TOP_IMAGE_HEIGHT = 0.0024; // The top of the cylindar in 3D mode in meters

    /*
     * Positive terminal is part of the image file.
     * The terminal is a cylinder, whose dimensions were determined by visual inspection.
     * The origin of the terminal is at the center of the cylinder's top.
     */
    Battery.POSITIVE_TERMINAL_ELLIPSE_SIZE = new Vector2(0.0025, 0.0005);
    Battery.POSITIVE_TERMINAL_CYLINDER_HEIGHT = 0.0009;
    Battery.POSITIVE_TERMINAL_Y_OFFSET = -(Battery.BODY_HEIGHT / 2) + 0.0004;

    /*
     * Negative terminal is part of the image file.
     * The terminal is an ellipse, whose dimension were determined by visual inspection.
     * The origin of the terminal is at the center of the ellipse.
     */
    Battery.NEGATIVE_TERMINAL_ELLIPSE_SIZE = new Vector2(0.0035, 0.0009); // dimension of the ellipse that defines the negative terminal
    Battery.NEGATIVE_TERMINAL_Y_OFFSET = -(Battery.BODY_HEIGHT / 2) + 0.00105; // center of the negative terminal, when it's the top terminal

    Constants.Battery = Battery;


    /*************************************************************************
     **                                                                     **
     **                             ENUMERATIONS                            **
     **                                                                     **
     *************************************************************************/

    Constants.Polarity = {
        POSITIVE:  1,
        NEGATIVE: -1
    };

    Constants.ConnectionPoint = {
        TOP: 1,
        BOTTOM: 2
    };


    /*************************************************************************
     **                                                                     **
     **                         DIELECTRIC MATERIAL                         **
     **                                                                     **
     *************************************************************************/

    var DielectricMaterial = {};

    DielectricMaterial.TEFLON_COLOR = '#00ffff';
    DielectricMaterial.GLASS_COLOR  = '#555555';
    DielectricMaterial.GLASS_ALPHA  = 0.16;
    DielectricMaterial.PAPER_COLOR  = '#ffffe0';
    DielectricMaterial.CUSTOM_COLOR = '#ffc601';

    Constants.DielectricMaterial = DielectricMaterial;


    /*************************************************************************
     **                                                                     **
     **                            CAPACITOR VIEW                           **
     **                                                                     **
     *************************************************************************/

    var DielectricCapacitorView = {};

    DielectricCapacitorView.DIELECTRIC_ALPHA_IN_EXCESS_CHARGE_MODE = 0.5;

    Constants.DielectricCapacitorView = DielectricCapacitorView;


    /*************************************************************************
     **                                                                     **
     **                               CHARGES                               **
     **                                                                     **
     *************************************************************************/

    var ChargeView = {};

    ChargeView.LINE_WIDTH = 2;
    ChargeView.SYMBOL_WIDTH = 6;
    ChargeView.POSITIVE_COLOR = '#ff0000';
    ChargeView.NEGATIVE_COLOR = '#0000ff';

    Constants.ChargeView = ChargeView;


    var DielectricTotalChargeView = {};
    
    DielectricTotalChargeView.SYMBOL_SPACING = Constants.PLATE_SEPARATION_RANGE.max * 0.3; // In meters
    DielectricTotalChargeView.SYMBOL_SPACING_EXPONENT = 1 / 4;
    DielectricTotalChargeView.NEGATIVE_CHARGE_OFFSET_RANGE = range({ min: 0, max: DielectricTotalChargeView.SYMBOL_SPACING / 2 });

    Constants.DielectricTotalChargeView = DielectricTotalChargeView;




    return Constants;
});
