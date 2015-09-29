define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');
    var range   = require('common/math/range');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SIM_WIDTH  = 880;  // Arbitrary units
    Constants.SIM_HEIGHT = 480;  // Arbitrary units
    Constants.SIM_X_OFFSET = 72; // Arbitrary units

    Constants.FRAME_DURATION = 1 / 30; // Seconds
    Constants.DT_PER_FRAME = 0.2; // Seconds

    Constants.MAX_VEL = 15;
    Constants.MAX_ACC = Number.MAX_VALUE;
    Constants.K = 900;
    Constants.COULOMB_POWER = -1.3;

    Constants.CORE_START = 300;
    Constants.CORE_END   = 775;
    Constants.DEFAULT_NUM_CORES = 6;
    Constants.CORE_LEVEL = 4;
    Constants.CORE_LEVEL_BOTTOM = 1;

    Constants.DEFAULT_AMPLITUDE = 70;
    Constants.DEFAULT_FREQUENCY = 2.6;
    Constants.DEFAULT_DECAY = 0.93;

    Constants.V_TO_AMP_SCALE = 0.9;
    Constants.AMPLITUDE_THRESHOLD = 2000;
    Constants.COLLISION_DIST = 18;

    Constants.NUM_ELECTRONS = 50;

    Constants.TURNSTILE_CENTER = new Vector2(Constants.SIM_X_OFFSET - 50, 190);
   	Constants.TURNSTILE_SPEED_SCALE = 0.02;

    Constants.RESISTANCE_RANGE = range({ min: 3, max: 14, defaultValue: 6 });
    Constants.coreCountToOhms = function(coreCount) {
        return coreCount * 0.2 / 3.0;
    };

    Constants.VOLTAGE_RANGE = range({ min: -12, max: 12, defaultValue: 2.88 });


    /*************************************************************************
     **                                                                     **
     **                            TURNSTILE VIEW                           **
     **                                                                     **
     *************************************************************************/

    var TurnstileView = {};

    TurnstileView.PINWHEEL_MODEL_WIDTH = 200;

    Constants.TurnstileView = TurnstileView;


    /*************************************************************************
     **                                                                     **
     **                           WIRE PATCH VIEW                           **
     **                                                                     **
     *************************************************************************/

    var WirePatchView = {};

    WirePatchView.OUTER_COLOR = '#d69d72';
    WirePatchView.INNER_COLOR = '#d5d5d5';
    WirePatchView.OUTER_WIDTH = 26;
    WirePatchView.INNER_WIDTH = 18;

    Constants.WirePatchView = WirePatchView;


    /*************************************************************************
     **                                                                     **
     **                             BATTERY VIEW                            **
     **                                                                     **
     *************************************************************************/

    var BatteryView = {};

    BatteryView.MODEL_HEIGHT = 143.33333333333334;

    Constants.BatteryView = BatteryView;


    /*************************************************************************
     **                                                                     **
     **                            RESISTOR VIEW                            **
     **                                                                     **
     *************************************************************************/

    var ResistorView = {};

    ResistorView.MODEL_HEIGHT = 105.1111111111111;
    var VMAX = 6;
    var RMAX = 1;
    ResistorView.MAX_POWER = VMAX * VMAX / RMAX;
    ResistorView.NUM_RATIO_SAMPLES = 100;
    ResistorView.CHANNEL_WIDTH = WirePatchView.INNER_WIDTH;
    ResistorView.OUTLINE_COLOR = '#3C1717';
    ResistorView.OUTLINE_WIDTH = 6;

    Constants.ResistorView = ResistorView;


    return Constants;
});
