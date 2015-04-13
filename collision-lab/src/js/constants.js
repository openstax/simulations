define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    //Constants.GRAVITATIONAL_ACCELERATION = 9.8; // m/s^2
    Constants.MIN_NUM_BALLS = 2;
    Constants.MAX_NUM_BALLS = 5;

    Constants.DEFAULT_BALL_SETTINGS = [
        { mass: 0.5, position: new Vector2(1.0,  0.0), velocity: new Vector2( 1.0,  0.3)  },
        { mass: 1.5, position: new Vector2(2.0,  0.5), velocity: new Vector2(-0.5, -0.5)  },
        { mass: 1.0, position: new Vector2(1.0, -0.5), velocity: new Vector2(-0.5, -0.25) },
        { mass: 1.0, position: new Vector2(2.2, -1.2), velocity: new Vector2( 1.1,  0.2)  },
        { mass: 1.0, position: new Vector2(1.2,  0.8), velocity: new Vector2(-1.1,  0)    }
    ];

    Constants.INTRO_DEFAULT_BALL_SETTINGS = [
        { mass: 0.5, position: new Vector2(1, 0), velocity: new Vector2(1, 0) },
        { mass: 1.5, position: new Vector2(2, 0), velocity: new Vector2(0, 0) }
    ];

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


    return Constants;
});
