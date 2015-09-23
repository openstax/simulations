define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.VMAX = 15;
    Constants.K = 900;
    Constants.COULOMB_POWER = -1.3;

    Constants.CORE_START = 300;
    Constants.CORE_END   = 775;
    Constants.DEFAULT_NUM_CORES = 6;
    Constants.CORE_LEVEL = 4;
    Constants.CORE_LEVEL_BOTTOM = 1;

    Constants.DEFAULT_AMPLITUDE = 70;
    Constants.DEFAULT_FREQUENCY = 2.6;
    Constants.DEFAULT_DECAY = .93;


    return Constants;
});
