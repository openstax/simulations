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
    Simulation.BORDER_BOUNDS_2D = new Rectangle(0, -0.89, 3.2, 1.78); // original height was 1.9

    Constants.Simulation = Simulation;

    /*************************************************************************
     **                                                                     **
     **                                SCENE                                **
     **                                                                     **
     *************************************************************************/

    var SceneView = {};

    SceneView.BORDER_FILL_COLOR = '#fff';
    SceneView.BORDER_FILL_ALPHA = 0.25;
    SceneView.BORDER_LINE_COLOR = '#fff';
    SceneView.BORDER_LINE_ALPHA = 1;
    SceneView.CM_MARKER_RADIUS = 14; // Pixels
    SceneView.CM_MARKER_THICKNESS = 7;
    SceneView.CM_MARKER_FILL_COLOR = '#fff';
    SceneView.CM_MARKER_FILL_ALPHA = 1;
    SceneView.CM_MARKER_LINE_COLOR = '#000';
    SceneView.CM_MARKER_LINE_ALPHA = 0.5;
    SceneView.CM_MARKER_LINE_WIDTH = 2;

    Constants.SceneView = SceneView;


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

    BallView.ARROW_TAIL_WIDTH  = 7;
    BallView.ARROW_HEAD_WIDTH  = 19;
    BallView.ARROW_HEAD_LENGTH = 17;
    BallView.ARROW_COLOR = '#cd2520';
    BallView.ARROW_ALPHA = 1;
    BallView.VELOCITY_SCALE = 0.5;
    BallView.VELOCITY_MARKER_COLOR = '#888';
    BallView.VELOCITY_MARKER_ALPHA = 1;
    BallView.VELOCITY_MARKER_RADIUS = 20;
    BallView.VELOCITY_MARKER_THICKNESS = 4;
    BallView.VELOCITY_MARKER_FONT = '28px Arial';
    BallView.NUMBER_FONT  = 'bold 24px Helvetica Neue';
    BallView.NUMBER_COLOR = '#fff';
    BallView.MOMENTUM_ARROW_TAIL_WIDTH  = 11;
    BallView.MOMENTUM_ARROW_HEAD_WIDTH  = 25;
    BallView.MOMENTUM_ARROW_HEAD_LENGTH = 21;
    BallView.MOMENTUM_ARROW_COLOR = '#FFD700';
    BallView.MOMENTUM_ARROW_ALPHA = 1;
    BallView.MOMENTUM_SCALE = BallView.VELOCITY_SCALE;
    BallView.PANEL_LINE_COLOR = '#444';
    BallView.PANEL_LINE_WIDTH = 1;
    BallView.PANEL_LINE_ALPHA = 1;
    BallView.PANEL_FILL_COLOR = '#fff';
    BallView.PANEL_FILL_ALPHA = 1;
    BallView.LABEL_FONT = '14px Helvetica Neue';
    BallView.LABEL_TEXT_COLOR = '#444';

    Constants.BallView = BallView;


    var BallTraceView = {};

    BallTraceView.LINE_WIDTH = 3;
    BallTraceView.LINE_COLOR = '#444';
    BallTraceView.LINE_ALPHA = 1;

    Constants.BallTraceView = BallTraceView;


    /*************************************************************************
     **                                                                     **
     **                           MOMENTA DIAGRAM                           **
     **                                                                     **
     *************************************************************************/

    var MomentaDiagram = {};

    MomentaDiagram.PANEL_COLOR = '#fff';
    MomentaDiagram.PANEL_ALPHA = 0.5;
    MomentaDiagram.PANEL_PADDING = 15; // Pixels
    MomentaDiagram.PANEL_PADDING_TOP = 40; // Pixels
    MomentaDiagram.BG_COLOR = '#fff';
    MomentaDiagram.GRID_COLOR = '#000';
    MomentaDiagram.GRID_ALPHA = 0.1;
    MomentaDiagram.TOTAL_COLOR = '#FF7400';
    MomentaDiagram.ONE_DIMENSION_ARROW_SPACING = 1;

    Constants.MomentaDiagram = MomentaDiagram;


    var MomentumView = {};

    MomentumView.ARROW_TAIL_WIDTH  = 5;
    MomentumView.ARROW_HEAD_WIDTH  = 15;
    MomentumView.ARROW_HEAD_LENGTH = 13;
    MomentumView.ARROW_COLOR = BallView.MOMENTUM_ARROW_COLOR;
    MomentumView.ARROW_ALPHA = BallView.MOMENTUM_ARROW_ALPHA;
    MomentumView.LABEL_FONT  = 'bold 12px Helvetica Neue';
    MomentumView.LABEL_COLOR = '#000';

    Constants.MomentumView = MomentumView;


    return Constants;
});
