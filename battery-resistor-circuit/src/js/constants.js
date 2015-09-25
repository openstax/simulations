define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.VMAX = 15;
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
    Constants.DEFAULT_DECAY = .93;

    Constants.V_TO_AMP_SCALE = 0.9;
    Constants.AMPLITUDE_THRESHOLD = 2000;
    Constants.COLLISION_DIST = 18;

    Constants.NUM_ELECTRONS = 50;


    return Constants;
});
