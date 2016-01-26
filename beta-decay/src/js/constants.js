define(function (require) {

    'use strict';


    var Constants = require('nuclear-physics/constants'); 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.FRAME_RATE = 25;
    Constants.DELTA_TIME_PER_FRAME = 5;

    Constants.LOCAL_CONSTANT = 'HEY';

    return Constants;
});
