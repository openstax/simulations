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
    Constants.DEFAULT_SOURCE_POINT_2 = new Vector2(-1.5, -0.2);

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


    /*************************************************************************
     **                                                                     **
     **                              LENS VIEW                              **
     **                                                                     **
     *************************************************************************/

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

    ObjectView.PICTURE_A_HEIGHT_IN_METERS = 0.73;
    ObjectView.PICTURE_X_ANCHOR = 0.57;
    ObjectView.PICTURE_Y_ANCHOR = 0.2;
    ObjectView.SECOND_POINT_Y_SPAN_IN_METERS = 0.32;//ObjectView.PICTURE_A_HEIGHT_IN_METERS * (1 - ObjectView.PICTURE_Y_ANCHOR * 2);

    Constants.ObjectView = ObjectView;


    var SourceObjectView = {};

    SourceObjectView.SECOND_POINT_COLOR = '#FF0000';
    SourceObjectView.SECOND_POINT_ALPHA = 1;
    SourceObjectView.SECOND_POINT_SIZE  = 12;

    Constants.SourceObjectView = SourceObjectView;


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


    /*************************************************************************
     **                                                                     **
     **                              RAYS VIEW                              **
     **                                                                     **
     *************************************************************************/

    var RaysView = {};

    RaysView.NO_RAYS = 0;
    RaysView.MARGINAL_RAYS = 1;
    RaysView.PRINCIPAL_RAYS = 2;
    RaysView.MANY_RAYS = 3;

    RaysView.LENS_TIP_OFFSET = 5; // Pixels

    RaysView.LINE_WIDTH = 2;
    RaysView.LINE_ALPHA = 1;

    RaysView.VIRTUAL_RAY_COLOR = '#00ff00';
    RaysView.POINT_1_COLOR = '#fff';
    RaysView.POINT_2_COLOR = '#ffff00';

    RaysView.GUIDE_ANGLE = Math.PI - 0.48; // Radians
    RaysView.GUIDE_FILL_COLOR = '#fd8606';
    RaysView.GUIDE_FILL_ALPHA = 1;
    RaysView.GUIDE_LINE_COLOR = '#dd6207';
    RaysView.GUIDE_LINE_ALPHA = 1;
    RaysView.GUIDE_LINE_WIDTH = 1;
    RaysView.GUIDE_WIDTH  = 0.48; // Meters
    RaysView.GUIDE_HEIGHT = 0.03; // Meters

    Constants.RaysView = RaysView;


    /*************************************************************************
     **                                                                     **
     **                             SCREEN VIEW                             **
     **                                                                     **
     *************************************************************************/

    var ScreenView = {};

    ScreenView.SCREEN_HEIGHT_IN_METERS = 1.5;

    Constants.ScreenView = ScreenView;


    return Constants;
});
