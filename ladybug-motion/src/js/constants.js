define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.MIN_SCENE_DIAMETER = 5; // centimeters
    Constants.ESTIMATION_SAMPLE_SIZE = 6;

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

    LadybugView.WING_OPEN_VELOCITY = 4; // centimeters per second

    Constants.LadybugView = LadybugView;


    return Constants;
});
