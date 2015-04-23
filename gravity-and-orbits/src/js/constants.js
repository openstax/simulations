define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.G = 6.67428E-11;

    /*************************************************************************
     **                                                                     **
     **                             SCENE VIEW                              **
     **                                                                     **
     *************************************************************************/

    var SceneView = {};

    SceneView.SCENE_SCALE = 1.5E-9;

    Constants.SceneView = SceneView;


    /*************************************************************************
     **                                                                     **
     **                              BODY VIEW                              **
     **                                                                     **
     *************************************************************************/

    var BodyView = {};

    // The percent difference between reference mass and current mass at which
    //   we switch to a generic body image.
    BodyView.GENERIC_BODY_THRESHOLD = 0.05; 

    Constants.BodyView = BodyView;


    return Constants;
});
