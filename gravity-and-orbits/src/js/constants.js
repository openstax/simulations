define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.G = 6.67428E-11;

    Constants.FRAME_RATE = 25;
    Constants.DAYS_PER_TICK = 1;
    Constants.SECONDS_PER_DAY = 86400;
    Constants.DT_PER_TICK = Constants.DAYS_PER_TICK * Constants.SECONDS_PER_DAY;

    Constants.MIN_SPEED_SCALE = 0.1;
    Constants.MAX_SPEED_SCALE = 2.0;
    // One quarter of the way up between min and max time scales
    Constants.DEFAULT_SPEED_SCALE = (Constants.MIN_SPEED_SCALE + Constants.MAX_SPEED_SCALE) / 4;

    // Colors
    Constants.SUN_COLOR       = '#E8561E';
    Constants.PLANET_COLOR    = '#3AD3FD';
    Constants.MOON_COLOR      = '#C5C6C5';
    Constants.SATELLITE_COLOR = '#B08F60';

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


    /*************************************************************************
     **                                                                     **
     **                           COLLISION VIEW                            **
     **                                                                     **
     *************************************************************************/

    var CollisionView = {};

    CollisionView.ANIMATION_DURATION = 1; // Seconds
    CollisionView.ANIMATION_MIDPOINT = 0.65;
    CollisionView.ANIMATION_ROTATION = Math.PI / 2;

    Constants.CollisionView = CollisionView;


    return Constants;
});
