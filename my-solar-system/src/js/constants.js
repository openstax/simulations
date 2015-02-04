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


    return Constants;
});
