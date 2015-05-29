define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');
    var range   = require('common/math/range');


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.MIN_SCENE_WIDTH  = 3.8; // Meters
    Constants.MIN_SCENE_HEIGHT = 2.3; // Meters

    Constants.DEFAULT_SOURCE_POINT_1 = new Vector2(-1.5,  0.0);
    Constants.DEFAULT_SOURCE_POINT_2 = new Vector2(-1.5, -0.1);

    /*************************************************************************
     **                                                                     **
     **                                 LENS                                **
     **                                                                     **
     *************************************************************************/

    var Lens = {};

    Lens.MIN_INDEX_OF_REFRACTION = 1.20;
    Lens.MAX_INDEX_OF_REFRACTION = 1.87;
    Lens.DEFAULT_INDEX_OF_REFRACTION = 1.53;

    Lens.MIN_RADIUS_OF_CURVATURE = 0.3;
    Lens.MAX_RADIUS_OF_CURVATURE = 1.3;
    Lens.DEFAULT_RADIUS_OF_CURVATURE = 0.8;

    Lens.MIN_DIAMETER = 0.3;
    Lens.MAX_DIAMETER = 1.3;
    Lens.DEFAULT_DIAMETER = 0.8;

    Constants.Lens = Lens;


    var LensView = {};

    LensView.INDEX_OF_REFRACTION_RANGE = range({ min: Lens.MIN_INDEX_OF_REFRACTION, max: Lens.MAX_INDEX_OF_REFRACTION });
    LensView.RADIUS_OF_CURVATURE_RANGE = range({ min: Lens.MIN_RADIUS_OF_CURVATURE, max: Lens.MAX_RADIUS_OF_CURVATURE });

    // The largest diameter possible times the ratio of the image's width to height
    LensView.WIDTH_AT_LARGEST_RADIUS = Lens.MAX_DIAMETER * (100 / 496);
    LensView.radiusToWidth = function(radiusOfCurvature) {
        var rangePercent = LensView.RADIUS_OF_CURVATURE_RANGE.percent(radiusOfCurvature);
        var widthPercent = Math.min(1, 0.1 + (1 - rangePercent));
        return LensView.WIDTH_AT_LARGEST_RADIUS * widthPercent;
    };

    LensView.FOCUS_POINT_COLOR = '#fff';
    LensView.FOCUS_POINT_ALPHA = 0.7;
    LensView.FOCUS_POINT_LINE_WIDTH = 2;
    LensView.FOCUS_POINT_SIZE = 16;

    Constants.LensView = LensView;


    /*************************************************************************
     **                                                                     **
     **                            SOURCE OBJECT                            **
     **                                                                     **
     *************************************************************************/

    var SourceObject = {};

    SourceObject.Types = {};
    SourceObject.Types.PICTURE_A = 1;
    SourceObject.Types.PICTURE_B = 2;
    SourceObject.Types.PICTURE_C = 3;
    SourceObject.Types.PICTURE_D = 4;
    SourceObject.Types.LIGHT     = 5;

    SourceObject.DEFAULT_TYPE = SourceObject.Types.PICTURE_A;

    Constants.SourceObject = SourceObject;


    /*************************************************************************
     **                                                                     **
     **                             OBJECT VIEW                             **
     **                                                                     **
     *************************************************************************/

    var ObjectView = {};

    ObjectView.PICTURE_A_HEIGHT_IN_METERS = 0.7;

    Constants.ObjectView = ObjectView;


    /*************************************************************************
     **                                                                     **
     **                             SCENE VIEW                              **
     **                                                                     **
     *************************************************************************/

    var SceneView = {};

    SceneView.AXIS_COLOR = '#000';
    SceneView.AXIS_ALPHA = 0.3;
    SceneView.AXIS_WIDTH = 2;

    Constants.SceneView = SceneView;


    return Constants;
});
