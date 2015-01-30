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

    Constants.GRAVITATIONAL_ACCELERATION = 9.8; // m/s^2
    Constants.AIR_DENSITY_AT_SEA_LEVEL = 1.6; // kg/m^3
    Constants.GROUND_Y = -1.3;
    Constants.CYLINDER_PERSPECTIVE_MODIFIER = 0.15;


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
    Cannon.WIDTH = 3.5; // meters, the length of the cannon
    Cannon.START_ANGLE = 80;
    Cannon.MIN_ANGLE = -28; // Don't want it moving into its own shadow. If we need to allow them to point it down more, I'll have to separate that shadow layer in the image.
    Cannon.MAX_ANGLE = 197;

    Constants.Cannon = Cannon;

    var CannonView = {};

    CannonView.PEDESTAL_TOP_COLOR  = '#558455'; //Colors.darkenHex(SceneView.GROUND_COLOR, 0.1);
    CannonView.PEDESTAL_SIDE_COLOR = '#ccc';
    CannonView.PEDESTAL_WIDTH = 5.5; // meters
    CannonView.PEDESTAL_PERSPECTIVE_MODIFIER = Constants.CYLINDER_PERSPECTIVE_MODIFIER;
    CannonView.AXIS_LINE_COLOR = '#000';
    CannonView.AXIS_LINE_ALPHA = 0.4;
    CannonView.AXIS_LINE_WIDTH = 2;

    CannonView.NUM_FLAME_PARTICLES = 500;
    CannonView.NUM_SMOKE_PARTICLES = 500;

    CannonView.SMOKE_PARTICLE_COLOR = '#ddd';
    CannonView.SMOKE_PARTICLE_RADIUS_RANGE = range({ min: 20, max: 70 });
    CannonView.SMOKE_PARTICLE_SPREAD_ANGLE = Math.PI / 12;
    CannonView.SMOKE_PARTICLE_SPREAD_ANGLE_RANGE = range({ min: -CannonView.SMOKE_PARTICLE_SPREAD_ANGLE / 2, max: CannonView.SMOKE_PARTICLE_SPREAD_ANGLE / 2 }); // radians
    CannonView.SMOKE_PARTICLE_VELOCITY_RANGE = range({ min: 500, max: 800 });
    CannonView.SMOKE_PARTICLE_LIFE_SPAN = range({ min: 0.5, max: 1.0 });
    CannonView.SMOKE_PARTICLE_EMISSION_DURATION = 0.28;
    CannonView.SMOKE_PARTICLE_EMISSION_RATE = 400;
    CannonView.SMOKE_PARTICLE_ALPHA = 0.5;
    CannonView.SMOKE_PARTICLE_FADE_POINT = 0.6;

    CannonView.FLAME_PARTICLE_INSIDE_COLOR = '#FFD500';
    CannonView.FLAME_PARTICLE_OUTSIDE_COLOR = '#C51010';
    CannonView.FLAME_PARTICLE_RADIUS_RANGE = range({ min: 16, max: 30 });
    CannonView.FLAME_PARTICLE_SPREAD_ANGLE = Math.PI / 16;
    CannonView.FLAME_PARTICLE_SPREAD_ANGLE_RANGE = range({ min: -CannonView.FLAME_PARTICLE_SPREAD_ANGLE / 2, max: CannonView.FLAME_PARTICLE_SPREAD_ANGLE / 2 }); // radians
    CannonView.FLAME_PARTICLE_VELOCITY_RANGE = range({ min: 800, max: 1200 });
    CannonView.FLAME_PARTICLE_LIFE_SPAN = range({ min: 0.12, max: 0.18 });
    CannonView.FLAME_PARTICLE_EMISSION_DURATION = 0.18;
    CannonView.FLAME_PARTICLE_EMISSION_RATE = 500;
    CannonView.FLAME_PARTICLE_FADE_POINT = 0.8;

    CannonView.PARTICLE_EMISSION_AREA_WIDTH = 31; // width of the opening at the end of the cannon in pixels

    Constants.CannonView = CannonView;


    /*************************************************************************
     **                                                                     **
     **                              PROJECTILES                            **
     **                                                                     **
     *************************************************************************/

    var Projectiles = [
        require('models/projectile'),
        require('models/projectile/tank-shell'),
        require('models/projectile/golfball'),
        require('models/projectile/baseball'),
        require('models/projectile/bowlingball'),
        require('models/projectile/football'),
        require('models/projectile/pumpkin'),
        require('models/projectile/adult-human'),
        require('models/projectile/piano'),
        require('models/projectile/buick')
    ];

    Constants.Projectiles = Projectiles;


    /*************************************************************************
     **                                                                     **
     **                               TRAJECTORY                            **
     **                                                                     **
     *************************************************************************/

    var TrajectoryView = {};

    TrajectoryView.AIR_RESISTANCE_ENABLED_COLOR  = '#ff0000';
    TrajectoryView.AIR_RESISTANCE_DISABLED_COLOR = '#0923fb';
    TrajectoryView.LINE_WIDTH = 3;
    TrajectoryView.SECOND_MARKER_COLOR = '#000';
    TrajectoryView.SECOND_MARKER_WIDTH = 18;
    TrajectoryView.SECOND_MARKER_ALPHA = 1;
    TrajectoryView.SECOND_MARKER_LINE_WIDTH = 4;

    Constants.TrajectoryView = TrajectoryView;


    /*************************************************************************
     **                                                                     **
     **                                 TARGET                              **
     **                                                                     **
     *************************************************************************/

    var Target = {};

    Target.DEFAULT_RADIUS = 1.25; // meters
    Target.DEFAULT_X = 16.8;      // meters

    Constants.Target = Target;


    var TargetView = {};

    TargetView.NUM_RINGS = 3;
    TargetView.RING_COLORS = [
        '#ff0000',
        '#ffffff'
    ];
    TargetView.LINE_COLOR = '#000';
    TargetView.LINE_WIDTH = 1;
    TargetView.PERSPECTIVE_MODIFIER = Constants.CYLINDER_PERSPECTIVE_MODIFIER;

    Constants.TargetView = TargetView;


    /*************************************************************************
     **                                                                     **
     **                                 DAVID                               **
     **                                                                     **
     *************************************************************************/

    var David = {};

    David.DEFAULT_X = 4;  // meters
    David.HEIGHT = 2.353; // meters
    David.BOUNDS_RELATIVE_TO_HEIGHT = new Rectangle(0.156, 0, 0.211, 1);

    Constants.David = David;

    return Constants;
});
