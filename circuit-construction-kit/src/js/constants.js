define(function (require) {

    'use strict';

    var Dimension = function(width, height) {
        this.width = width;
        this.height = height;
    };

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.EPSILON = 1E-6;

    var aspectRatio = 1.2;
    var SCALE = 0.5;
    var modelWidth = 10;
    var modelHeight = modelWidth / aspectRatio;
    var switchscale = 1.45;
    var bulbLength = 1;
    var bulbHeight = 1.5;
    var bulbDistJ = 0.39333;
    var bulbScale = 1.9;
    Constants.MODEL_HEIGHT = modelHeight;
    Constants.MODEL_WIDTH = modelWidth;
    Constants.ELECTRON_DX = 0.56 * SCALE;
	Constants.RESISTOR_DIMENSION       = new Dimension(1.3 * SCALE, 0.6 * SCALE);
	Constants.CAP_DIM                  = new Dimension(1.8 * SCALE, 0.6 * SCALE);
	Constants.AC_DIM                   = new Dimension(1.3 * SCALE, 0.6 * SCALE);
	Constants.SWITCH_DIMENSION         = new Dimension(1.5 * SCALE * switchscale, 0.8 * SCALE * switchscale);
	Constants.LEVER_DIMENSION          = new Dimension(1.0 * SCALE * switchscale, 0.5 * SCALE * switchscale);
	Constants.BATTERY_DIMENSION        = new Dimension(1.9 * SCALE, 0.7 * SCALE);
	Constants.SERIES_AMMETER_DIMENSION = new Dimension(2.33 * SCALE, 0.92 * SCALE);
	Constants.INDUCTOR_DIM             = new Dimension(2.5 * SCALE, 0.6 * SCALE);
	Constants.BULB_DIMENSION           = new Dimension(bulbLength * SCALE * bulbScale, bulbHeight * SCALE * bulbScale);
	Constants.BULB_DISTANCE_BETWEEN_JUNCTIONS = bulbDistJ * SCALE * bulbScale;
    Constants.WIRE_LENGTH = Constants.BATTERY_DIMENSION.width * 1.2;
    Constants.JUNCTION_GRAPHIC_STROKE_WIDTH = 0.015;
    Constants.JUNCTION_RADIUS = 0.162;
    Constants.MIN_RESISTANCE = 1E-8;
    Constants.MAX_RESISTANCE = 100;
    Constants.SCH_BULB_DIST = 1;

    Constants.FRAME_DURATION = 30 / 1000; // Seconds
    Constants.DT_PER_FRAME = Constants.FRAME_DURATION / 1; // Simulation units = seconds

    Constants.SAT_SCALE = 1000; // Used to scale shapes and coordinates for SAT collision detection

    Constants.WIRE_THICKNESS = 0.22; // Original: 0.3
    Constants.DEFAULT_SCALE = 109.3 / 100.0;

    Constants.TILT = -0.8058034940839864 + Math.PI / 2;

    Constants.TOOLBOX_WIDTH = 68;
    Constants.TOOLBOX_PADDING = 10;
    Constants.TOOLBOX_ITEM_SPACING = 12;
    Constants.TOOLBOX_LABEL_FONT = '12px Helvetica Neue';
    Constants.TOOLBOX_LABEL_COLOR = '#000';

    Constants.SELECTION_COLOR = '#21366b';
    Constants.SELECTION_AURA_ALPHA = 0.2;

    Constants.VALUE_LABEL_COLOR = '#fff';

    Constants.MIN_SCALE = 0.5;
    Constants.MAX_SCALE = 2;

    Constants.MAX_BATTERY_VOLTAGE = 100;
    Constants.MAX_HUGE_BATTERY_VOLTAGE = 100000;


    /*************************************************************************
     **                                                                     **
     **                               INDUCTOR                              **
     **                                                                     **
     *************************************************************************/

    var Inductor = {};

    Inductor.MIN_INDUCTANCE = 10;
    Inductor.MAX_INDUCTANCE = 100;
    // 50 henries makes tau=L/R = 5 sec for default resistor; 
    //   this saturates in about 5 * tau = 25 sec
    Inductor.DEFAULT_INDUCTANCE = 50;

    Constants.Inductor = Inductor;


    /*************************************************************************
     **                                                                     **
     **                              CAPACITOR                              **
     **                                                                     **
     *************************************************************************/

    var Capacitor = {};

    Capacitor.DEFAULT_CAPACITANCE = 1E-1;

    Constants.Capacitor = Capacitor;


    /*************************************************************************
     **                                                                     **
     **                               BATTERY                               **
     **                                                                     **
     *************************************************************************/

    var Battery = {};

    Battery.CURRENT_CHANGE_THRESHOLD = 0.01;
    Battery.DEFAULT_INTERNAL_RESISTANCE = 0.001;

    Constants.Battery = Battery;


    /*************************************************************************
     **                                                                     **
     **                                WIRE                                 **
     **                                                                     **
     *************************************************************************/

    var Wire = {};

    Wire.LIFELIKE_THICKNESS  = Constants.WIRE_THICKNESS * Constants.DEFAULT_SCALE;
    Wire.SCHEMATIC_THICKNESS = Constants.WIRE_THICKNESS * Constants.DEFAULT_SCALE * 0.6;

    Constants.Wire = Wire;


    /*************************************************************************
     **                                                                     **
     **                               SWITCH                                **
     **                                                                     **
     *************************************************************************/

    var Switch = {};

    Switch.OPEN_RESISTANCE = 1E11;
    Switch.MAX_HANDLE_ANGLE = Math.PI * 0.6;
    Switch.DEFAULT_HANDLE_ANGLE_OPEN = Switch.MAX_HANDLE_ANGLE;
    Switch.HANDLE_ANGLE_CLOSED = 0;

    Constants.Switch = Switch;
    


    /*************************************************************************
     **                                                                     **
     **                     CONSTANT-DENSITY PROPAGATOR                     **
     **                                                                     **
     *************************************************************************/

    var ConstantDensityPropagator = {};

    ConstantDensityPropagator.FIRE_CURRENT = 10;
    ConstantDensityPropagator.MIN_CURRENT = Math.pow(10, -10);
    ConstantDensityPropagator.MAX_STEP = Constants.ELECTRON_DX * 0.43;

    Constants.ConstantDensityPropagator = ConstantDensityPropagator;

    /*************************************************************************
     **                                                                     **
     **                              WIRE VIEW                              **
     **                                                                     **
     *************************************************************************/

    var WireView = {};

    WireView.WIRE_COLOR = '#d1996d';
    WireView.END_COLOR  = '#c5865a'; //c5865a
    WireView.WIRE_WIDTH = Constants.WIRE_THICKNESS;
    WireView.SCHEMATIC_WIRE_WIDTH = 0.08;

    Constants.WireView = WireView;


    /*************************************************************************
     **                                                                     **
     **                            RESISTOR VIEW                            **
     **                                                                     **
     *************************************************************************/

    var ResistorView = {};

    ResistorView.BAND_COLORS = [
        '#000000', // Black
        '#964B00', // Brown
        '#ff0000', // Red
        '#FFA500', // Orange
        '#FFFF00', // Yellow
        '#9ACD32', // Green
        '#6495ED', // Blue
        '#EE82EE', // Violet
        '#A0A0A0', // Gray
        '#ffffff'  // White
    ];

    Constants.ResistorView = ResistorView;


    /*************************************************************************
     **                                                                     **
     **                              BULB VIEW                              **
     **                                                                     **
     *************************************************************************/

    var LightBulbView = {};

    /**
     * The percent of the image width/height that would equal the offset from the
     *   origin (the start junction) to the end junction
     */
    var offsetX = 18;
    var offsetY = 40;
    LightBulbView.END_POINT_OFFSET_PERCENT_X = (offsetX / 125);
    LightBulbView.END_POINT_OFFSET_PERCENT_Y = (offsetY / 213);
    /**
     * Ratio of the length of the vector from start to end junction in pixels to
     *   width of the image in pixels
     */
    LightBulbView.LENGTH_TO_WIDTH_RATIO = Math.sqrt(offsetX * offsetX + offsetY * offsetY) / 125;

    Constants.LightBulbView = LightBulbView;


    /*************************************************************************
     **                                                                     **
     **                            ELECTRONS VIEW                           **
     **                                                                     **
     *************************************************************************/

    var ElectronsView = {};

    ElectronsView.COLOR = '#25b5fd';
    ElectronsView.RADIUS = 0.06;

    Constants.ElectronsView = ElectronsView;


    /*************************************************************************
     **                                                                     **
     **                            JUNCTION VIEW                            **
     **                                                                     **
     *************************************************************************/

    var JunctionView = {};

    JunctionView.RADIUS = (Constants.WIRE_THICKNESS / 2);
    JunctionView.SOLDER_COLOR = '#aaa';
    JunctionView.SOLDER_RADIUS = JunctionView.RADIUS * 1.5;

    Constants.JunctionView = JunctionView;


    /*************************************************************************
     **                                                                     **
     **                            VOLTMETER VIEW                           **
     **                                                                     **
     *************************************************************************/

    var VoltmeterView = {};

    VoltmeterView.HEIGHT = 4; // In sim units
    VoltmeterView.PROBE_HEIGHT = VoltmeterView.HEIGHT * 0.6; // In sim units
    VoltmeterView.RED_COLOR   = '#ff0000';
    VoltmeterView.BLACK_COLOR = '#111111';

    Constants.VoltmeterView = VoltmeterView;


    return Constants;
});
