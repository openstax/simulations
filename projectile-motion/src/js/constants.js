define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var range     = require('common/math/range');
    var Colors    = require('common/colors/colors');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.GRAVITY = 9.8; // m/s^2
    Constants.AIR_DENSITY_AT_SEA_LEVEL = 1.6; // kg/m^3
    Constants.GROUND_Y = -0.77;


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
    Cannon.START_Y = 0;
    Cannon.HEIGHT_OFF_GROUND = -Constants.GROUND_Y; // meters
    Cannon.WIDTH = 2; // meters, the length of the cannon
    Cannon.START_ANGLE = 80;
    Cannon.MIN_ANGLE = -28; // Don't want it moving into its own shadow. If we need to allow them to point it down more, I'll have to separate that shadow layer in the image.
    Cannon.MAX_ANGLE = 197;

    Constants.Cannon = Cannon;

    var CannonView = {};

    CannonView.PEDESTAL_TOP_COLOR  = '#558455'; //Colors.darkenHex(SceneView.GROUND_COLOR, 0.1);
    CannonView.PEDESTAL_SIDE_COLOR = '#ccc';
    CannonView.PEDESTAL_WIDTH = 3.6; // meters
    CannonView.PEDESTAL_PERSPECTIVE_MODIFIER = 0.115;
    CannonView.AXIS_LINE_COLOR = '#000';
    CannonView.AXIS_LINE_ALPHA = 0.4;
    CannonView.AXIS_LINE_WIDTH = 2;

    CannonView.NUM_FLAME_PARTICLES = 500;
    CannonView.NUM_SMOKE_PARTICLES = 500;

    CannonView.SMOKE_PARTICLE_COLOR = '#ddd';

    CannonView.FLAME_PARTICLE_INSIDE_COLOR = '#FFD500';
    CannonView.FLAME_PARTICLE_OUTSIDE_COLOR = '#C51010';
    CannonView.FLAME_PARTICLE_RADIUS_RANGE = range({ min: 16, max: 30 });
    CannonView.FLAME_PARTICLE_SPREAD_ANGLE = Math.PI / 12;
    CannonView.FLAME_PARTICLE_SPREAD_ANGLE_RANGE = range({ min: -CannonView.FLAME_PARTICLE_SPREAD_ANGLE / 2, max: CannonView.FLAME_PARTICLE_SPREAD_ANGLE / 2 }); // radians
    CannonView.FLAME_PARTICLE_VELOCITY_RANGE = range({ min: 800, max: 1200 });
    CannonView.FLAME_PARTICLE_LIFE_SPAN = range({ min: 0.1, max: 0.15 });
    CannonView.FLAME_PARTICLE_EMISSION_DURATION = 0.2;
    CannonView.FLAME_PARTICLE_EMISSION_RATE = 500;
    CannonView.FLAME_PARTICLE_FADE_POINT = 0.8;

    CannonView.PARTICLE_EMISSION_AREA_WIDTH = 31; // width of the opening at the end of the cannon in pixels

    Constants.CannonView = CannonView;

    return Constants;
});
