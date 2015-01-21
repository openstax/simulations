define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var range     = require('common/math/range');


    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    var Constants = {}; 

    Constants.GRAVITY = 9.8; // m/s^2
    Constants.AIR_DENSITY_AT_SEA_LEVEL = 1.6; // kg/m^3

    var SceneView = {};

    SceneView.ORIGIN_X_PERCENT = 0.15; // location of origin if 0 is left of screen and 1 is right
    SceneView.ORIGIN_Y_PERCENT = 0.85; // location of origin if 0 is top of screen and 1 is bottom
    SceneView.GROUND_COLOR_1 = '#8CCD75';
    SceneView.GROUND_COLOR_2 = '#4aa02c';

    Constants.SceneView = SceneView;

    return Constants;
});
