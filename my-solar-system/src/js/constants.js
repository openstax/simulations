define(function (require) {

    'use strict';

    var range = require('common/math/range');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.BODY_COLORS = [
    	// 'yellow', 
     //    'magenta', 
     //    'cyan',
     //    'green'
        // '#f0cf31',
        // '#f47b4d',
        // '#eeeeee',
        // '#71b653'
        '#D89965',
        '#D86565',
        '#3C8282',
        '#50AD50'
    ];
    Constants.MAX_BODIES = Constants.BODY_COLORS.length;
    Constants.MIN_BODIES = 2;
    Constants.MIN_BODY_MASS = 0.000001;

    Constants.G = 10000; // Gravitational constant...not the actual one, but one that fits our scale

    Constants.FRAME_DURATION = 10;
    Constants.STEP_TIMES = [ 0.0005, 0.00075, 0.0011, 0.0017, 0.0025, 0.004, 0.006, 0.010, 0.015, 0.025, 0.04 ];
    Constants.STEP_COUNTS_PER_FRAME = [ 25, 20, 16, 12, 10, 8, 6, 5, 4, 3, 2 ];
    Constants.DEFAULT_TIME_STEP = 0.009;
    Constants.DEFAULT_NUM_STEPS_PER_FRAME = 4;


    /*************************************************************************
     **                                                                     **
     **                           COLLISION VIEW                            **
     **                                                                     **
     *************************************************************************/

    var CollisionView = {};

    CollisionView.DIAMETER_RANGE = range({ min: 40, max: 60 }); // Simulation units
    CollisionView.ANIMATION_DURATION = 1; // Seconds
    CollisionView.ANIMATION_MIDPOINT = 0.65;
    CollisionView.ANIMATION_ROTATION = Math.PI / 2;

    Constants.CollisionView = CollisionView;


    /*************************************************************************
     **                                                                     **
     **                           COLLISION VIEW                            **
     **                                                                     **
     *************************************************************************/

    var BodyView = {};

    BodyView.ARROW_TAIL_WIDTH  = 5;
    BodyView.ARROW_HEAD_WIDTH  = 17;
    BodyView.ARROW_HEAD_LENGTH = 17;
    BodyView.ARROW_COLOR = '#fff';
    BodyView.ARROW_ALPHA = 0.4;
    BodyView.VELOCITY_MARKER_COLOR = '#fff';
    BodyView.VELOCITY_MARKER_ALPHA = 0.6;
    BodyView.VELOCITY_MARKER_RADIUS = 20;
    BodyView.VELOCITY_MARKER_THICKNESS = 4;
    BodyView.VELOCITY_MARKER_FONT = '28px Arial';

    Constants.BodyView = BodyView;



    return Constants;
});
