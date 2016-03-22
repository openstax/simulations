define(function (require) {

    'use strict';


    var Constants = require('nuclear-physics/constants'); 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    // constants
    var RSConstants = {
        //----------------------------------------------------------------------------
        // Model
        //----------------------------------------------------------------------------

        // alpha particle
        MIN_ALPHA_ENERGY: 50,
        MAX_ALPHA_ENERGY: 100,
        DEFAULT_ALPHA_ENERGY: 80,

        DEFAULT_SHOW_TRACES: false,

        // protons
        MIN_PROTON_COUNT: 20,
        MAX_PROTON_COUNT: 100,
        DEFAULT_PROTON_COUNT: 79,

        // neutrons
        MIN_NEUTRON_COUNT: 20,
        MAX_NEUTRON_COUNT: 150,
        DEFAULT_NEUTRON_COUNT: 118,


        // ray gun
        MAX_PARTICLES: 20,
        GUN_INTENSITY: 1,
        X0_MIN: 10,

        //----------------------------------------------------------------------------
        // Dimensions
        //----------------------------------------------------------------------------

        // Animation space size, must be square!
        SPACE_NODE_WIDTH: 490,
        SPACE_NODE_HEIGHT: 490,

        // Animation space size, must be square!
        BOX_SIZE: 480,
        BOX_SIZE_SMALL: 400,

        RayGunView: {
            WIDTH: 20,
            BARREL_CENTER_X: 0.37,
            BARREL_CENTER_Y: 0.5,
            RAY_WIDTH: 0.4,
            RAY_HEIGHT: 0.75
        }
    };

    _.extend(Constants, RSConstants);

    return Constants;
});
