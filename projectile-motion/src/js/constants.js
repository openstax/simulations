define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var range     = require('common/math/range');


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.GRAVITY = 9.8; // m/s^2
    Constants.AIR_DENSITY_AT_SEA_LEVEL = 1.6; // kg/m^3
    Constants.GROUND_Y = -0.75;


    /*************************************************************************
     **                                                                     **
     **                               SCENE VIEW                            **
     **                                                                     **
     *************************************************************************/

    var SceneView = {};

    // Origin is at the ground height and cannon's starting x
    SceneView.ORIGIN_X_PERCENT = 0.15; // location of origin if 0 is left of screen and 1 is right
    SceneView.ORIGIN_Y_PERCENT = 0.85; // location of origin if 0 is top of screen and 1 is bottom
    SceneView.GROUND_COLOR = '#669966';
    SceneView.MAX_SCALE = 120;
    SceneView.MIN_SCALE = 0.5;

    Constants.SceneView = SceneView;


    /*************************************************************************
     **                                                                     **
     **                                 CANNON                              **
     **                                                                     **
     *************************************************************************/

    var Cannon = {};

    Cannon.START_X = 0;
    Cannon.START_Y = 5;
    Cannon.HEIGHT_OFF_GROUND = -Constants.GROUND_Y; // meters
    Cannon.WIDTH = 2; // meters, the length of the cannon
    Cannon.START_ANGLE = 80;
    Cannon.MIN_ANGLE = -28; // Don't want it moving into its own shadow. If we need to allow them to point it down more, I'll have to separate that shadow layer in the image.
    Cannon.MAX_ANGLE = 197;

    Constants.Cannon = Cannon;

    var CannonView = {};

    CannonView.PEDESTAL_TOP_COLOR  = SceneView.GROUND_COLOR;
    CannonView.PEDESTAL_SIDE_COLOR = '#ccc';
    CannonView.PEDESTAL_WIDTH = 3.4; // meters
    CannonView.PEDESTAL_PERSPECTIVE_MODIFIER = 0.115;

    Constants.CannonView = CannonView;

    return Constants;
});
