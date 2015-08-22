define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var range     = require('common/math/range');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SPEED_OF_LIGHT = 6;

    // Original values were 40ms frame duration and 0.5s dt_per_frame, but I
    //   changed it to an equivalent sim-seconds-per-real-second in order to
    //   have a higher framerate.
    Constants.FRAME_DURATION = 0.030; // Seconds
    Constants.DT_PER_FRAME   = 0.375; // Seconds

    Constants.SIMULATION_BOUNDS = new Rectangle(0, 0, 1000, 700);
    Constants.SIMULATION_ORIGIN = new Vector2(108, 345);

    Constants.FREQUENCY_RANGE = range({ min: 0, max: 200, defaultValue: 100 });
    Constants.FREQUENCY_SCALE = 1 / 5000;
    Constants.AMPLITUDE_RANGE = range({ min: 0, max: 100, defaultValue: 50 });
    Constants.DEFAULT_FREQUENCY = Constants.FREQUENCY_RANGE.defaultValue * Constants.FREQUENCY_SCALE;
    Constants.DEFAULT_AMPLITUDE = Constants.AMPLITUDE_RANGE.defaultValue;

    Constants.PANEL_BG = '#D6DFE9';


    /*************************************************************************
     **                                                                     **
     **                          FIELD LATTICE VIEW                         **
     **                                                                     **
     *************************************************************************/

    var FieldLatticeView = {};

    FieldLatticeView.NO_FIELD = 0;
    FieldLatticeView.FULL_FIELD = 1;
    FieldLatticeView.CURVE = 2;
    FieldLatticeView.CURVE_WITH_VECTORS = 3;

    FieldLatticeView.SHOW_ELECTRIC_FIELD = -1;
    FieldLatticeView.SHOW_FORCE_ON_ELECTRON = 1;

    FieldLatticeView.FORCE_COLOR = '#c80000';
    FieldLatticeView.FIELD_COLOR = '#21366b';

    FieldLatticeView.ARROW_HEAD_WIDTH = 10;
    FieldLatticeView.ARROW_HEAD_LENGTH = 10;
    FieldLatticeView.ARROW_TAIL_WIDTH = 4;
    FieldLatticeView.ARROW_LINE_WIDTH = 1;

    Constants.FieldLatticeView = FieldLatticeView;

    return Constants;
});
