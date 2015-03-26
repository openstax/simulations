define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.MIN_SCENE_DIAMETER = 5; // centimeters
    Constants.ESTIMATION_SAMPLE_SIZE = 6; // number of samples


    /*************************************************************************
     **                                                                     **
     **                             UPDATE MODES                            **
     **                                                                     **
     *************************************************************************/

    Constants.UpdateMode = {
    	POSITION:     0,
    	VELOCITY:     1,
    	ACCELERATION: 2
    };


    /*************************************************************************
     **                                                                     **
     **                               LADYBUG                               **
     **                                                                     **
     *************************************************************************/

    var Ladybug = {};

    Ladybug.DEFAULT_WIDTH  = 0.4; // centimeters
    Ladybug.DEFAULT_LENGTH = 0.6; // centimeters

    Constants.Ladybug = Ladybug;


    var LadybugView = {};

    LadybugView.WING_OPEN_VELOCITY = 2; // centimeters per second

    Constants.LadybugView = LadybugView;


    /*************************************************************************
     **                                                                     **
     **                             LADYBUG MOVER                           **
     **                                                                     **
     *************************************************************************/

    var LadybugMover = {};

    LadybugMover.CIRCLE_RADIUS = 4; // centimeters
    LadybugMover.CIRCLE_SPEED = 0.12 * 0.7; // centimeters per second
    LadybugMover.ELLIPSE_A = 3; // centimeters
    LadybugMover.ELLIPSE_B = 5; // centimeters

    Constants.LadybugMover = LadybugMover;


    return Constants;
});
