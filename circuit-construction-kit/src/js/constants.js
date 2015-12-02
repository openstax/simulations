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
    Constants.SCH_BULB_DIST = 1;

    Constants.WIRE_THICKNESS = 0.3;
    Constants.DEFAULT_SCALE = 109.3 / 100.0;

    Constants.TILT = -0.8058034940839864;

    Constants.TOOLBOX_WIDTH = 70;
    Constants.TOOLBOX_PADDING = 10;
    Constants.TOOLBOX_ITEM_SPACING = 15;
    Constants.TOOLBOX_LABEL_FONT = '12px Helvetica Neue';
    Constants.TOOLBOX_LABEL_COLOR = '#000';

    Constants.SELECTION_COLOR = '#21366b';
    Constants.SELECTION_AURA_ALPHA = 0.2;


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

    WireView.OUTER_COLOR = '#d69d72';
    WireView.INNER_COLOR = '#d5d5d5';
    WireView.OUTER_WIDTH = 22;
    WireView.INNER_WIDTH = 14;

    Constants.WireView = WireView;

    return Constants;
});
