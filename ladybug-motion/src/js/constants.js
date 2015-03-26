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


    /*************************************************************************
     **                                                                     **
     **                         REMOTE CONTROL VIEW                         **
     **                                                                     **
     *************************************************************************/

    var RemoteControlView = {};

    RemoteControlView.RIGHT = 20;
    RemoteControlView.BOTTOM = 82;
    RemoteControlView.TAB_BG_COLOR = '#fff';
    RemoteControlView.TAB_BG_ALPHA = 0.2;
    RemoteControlView.TAB_ACTIVE_BG_COLOR = '#fff';
    RemoteControlView.TAB_ACTIVE_BG_ALPHA = 0.5;
    RemoteControlView.TAB_FONT = 'bold 14px Arial';
    RemoteControlView.TAB_WIDTH = 108;
    RemoteControlView.TAB_HEIGHT = 36;
    RemoteControlView.TABS = [{
        label: 'Position',
        color: '#2575BA',
    },{
        label: 'Velocity',
        color: '#CD2520',
    },{
        label: 'Acceleration',
        color: '#349E34',
    }];
    RemoteControlView.PANEL_PADDING = 10;
    RemoteControlView.PANEL_WIDTH  = 186; // pixels
    RemoteControlView.PANEL_HEIGHT = 210; // pixels
    RemoteControlView.AREA_WIDTH  = RemoteControlView.PANEL_WIDTH - 2 * RemoteControlView.PANEL_PADDING;
    RemoteControlView.AREA_HEIGHT = RemoteControlView.PANEL_WIDTH - 2 * RemoteControlView.PANEL_PADDING;
    RemoteControlView.ARROW_AREA_COLOR = '#fff';
    RemoteControlView.ARROW_AREA_ALPHA = 0.5;

    Constants.RemoteControlView = RemoteControlView;


    return Constants;
});
