define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    //Constants.GRAVITATIONAL_ACCELERATION = 9.8; // m/s^2
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

    Constants.G = 10000; // Gravitational constant...not the actual one, but one that fits our scale

    Constants.STEP_TIMES = [ 0.0005, 0.00075, 0.0011, 0.0017, 0.0025, 0.004, 0.006, 0.010, 0.015, 0.025, 0.04 ];
    Constants.STEP_COUNTS_PER_FRAME = [ 25, 20, 16, 12, 10, 8, 6, 5, 4, 3, 2 ];
    Constants.DEFAULT_TIME_STEP = 0.009;
    Constants.DEFAULT_NUM_STEPS_PER_FRAME = 4;


    return Constants;
});
