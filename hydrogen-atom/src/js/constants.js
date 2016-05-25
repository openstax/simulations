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
        BOX_SIZE: 380,
        BOX_SIZE_SMALL: 320,

        RUTHERFORD_ACTUAL: 150,
        PUDDING_ACTUAL: 300,

        PARTICLE_SCALE: 4,

        RayGunView: {
            WIDTH: 20,
            BARREL_CENTER_X: 0.37,
            BARREL_CENTER_Y: 0.5,
            RAY_WIDTH: 0.4,
            RAY_HEIGHT: 0.75
        },

        AtomView: {
            OUTLINE_LINE_WIDTH: 1.5,
            OUTLINE_LINE_DASH: [ 2, 3 ],
            OUTLINE_STROKE_COLOR: 0XFFFFFF,
            ELECTRON_ANGULAR_SPEED: 0.75
        },

        PuddingView: {
            ELECTRON_COUNT: 79
        }
    };

    RSConstants.AtomModel = {
        MIN_NUCLEUS_RADIUS: 14,
        MIN_PARTICLE_COUNT: RSConstants.MIN_PROTON_COUNT + RSConstants.MIN_NEUTRON_COUNT,
        MAX_PARTICLE_COUNT: RSConstants.MAX_PROTON_COUNT + RSConstants.MAX_NEUTRON_COUNT,
        PARTICLE_COUNT_EXP: 0.333
    };

    _.extend(Constants, RSConstants);

    return Constants;
});
