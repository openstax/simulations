define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    //Constants.GRAVITATIONAL_ACCELERATION = 9.8; // m/s^2


    /*************************************************************************
     **                                                                     **
     **                             SIMULATION                              **
     **                                                                     **
     *************************************************************************/

    var Simulation = {};

    Simulation.DEFAULT_TIMESCALE = 0.5; // multiplier for time steps
    Simulation.STEP_DURATION = 0.01; // seconds

    Simulation.MIN_NUM_BALLS = 2;
    Simulation.MAX_NUM_BALLS = 5;

    Simulation.DEFAULT_BALL_SETTINGS = [
        { mass: 0.5, position: new Vector2(1.0,  0.00), velocity: new Vector2( 1.0,  0.3)  },
        { mass: 1.5, position: new Vector2(2.0,  0.50), velocity: new Vector2(-0.5, -0.5)  },
        { mass: 1.0, position: new Vector2(1.0, -0.50), velocity: new Vector2(-0.5, -0.25) },
        { mass: 1.0, position: new Vector2(2.2, -0.65), velocity: new Vector2( 1.1,  0.2)  },
        { mass: 1.0, position: new Vector2(1.2,  0.65), velocity: new Vector2(-1.1,  0)    }
    ];

    Simulation.INTRO_DEFAULT_BALL_SETTINGS = [
        { mass: 0.5, position: new Vector2(1, 0), velocity: new Vector2(1, 0) },
        { mass: 1.5, position: new Vector2(2, 0), velocity: new Vector2(0, 0) }
    ];

    Simulation.BORDER_BOUNDS_1D = new Rectangle(0, -0.4,  3.2, 0.8);
    Simulation.BORDER_BOUNDS_2D = new Rectangle(0, -0.87, 3.2, 1.74); // original height was 1.9

    Constants.Simulation = Simulation;

    /*************************************************************************
     **                                                                     **
     **                                BALL                                 **
     **                                                                     **
     *************************************************************************/

    var Ball = {};

    Ball.COLORS = [
        '#bece8b',
        '#a5aae2',
        '#f4c24b',
        '#7ab0b3',
        '#8977a4'
    ];

    Ball.DEFAULT_MASS = 1; // kg
    Ball.MIN_MASS = 0.1; // kg
    Ball.MAX_MASS = 3.0; // kg

    Constants.Ball = Ball;


    var BallView = {};

    BallView.ARROW_TAIL_WIDTH  = 5;
    BallView.ARROW_HEAD_WIDTH  = 17;
    BallView.ARROW_HEAD_LENGTH = 17;
    BallView.ARROW_COLOR = '#999';
    BallView.ARROW_ALPHA = 1;
    BallView.VELOCITY_MARKER_COLOR = '#999';
    BallView.VELOCITY_MARKER_ALPHA = 1;
    BallView.VELOCITY_MARKER_RADIUS = 20;
    BallView.VELOCITY_MARKER_THICKNESS = 4;
    BallView.VELOCITY_MARKER_FONT = '28px Arial';
    BallView.NUMBER_FONT  = 'bold 24px Helvetica Neue';
    BallView.NUMBER_COLOR = '#fff';

    Constants.BallView = BallView;


    var BallTraceView = {};

    BallTraceView.LINE_WIDTH = 3;

    Constants.BallTraceView = BallTraceView;


    return Constants;
});
