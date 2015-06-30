define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SIM_HEIGHT_IN_METERS = 4.5; // Meters



    /*************************************************************************
     **                                                                     **
     **                                SCENE                                **
     **                                                                     **
     *************************************************************************/

    var SceneView = {};

    SceneView.PANEL_BG = '#ededed';
    SceneView.PANEL_MARGIN = 20;
    SceneView.SHORT_SCREEN_PANEL_MARGIN = 13;

    SceneView.GRID_COLOR = '#000';
    SceneView.GRID_ALPHA = 0.15;
    SceneView.GRID_MAJOR_SIZE_IN_METERS = 0.5;
    SceneView.GRID_MINOR_SIZE_IN_METERS = 0.1;

    Constants.SceneView = SceneView;

    return Constants;
});
