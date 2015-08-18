define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

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
    Constants.FRAME_DURATION = 0.030;
    Constants.DT_PER_FRAME = 0.375;

    Constants.SIMULATION_BOUNDS = new Rectangle(0, 0, 1000, 700);
    Constants.SIMULATION_ORIGIN = new Vector2(108, 325);

    Constants.PANEL_BG = '#D6DFE9';

    return Constants;
});
