define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.MIN_STAGE_WIDTH = 3.8; // Meters

    Constants.DEFAULT_SOURCE_POINT_1 = new Vector2(-1.5,  0.0);
	Constants.DEFAULT_SOURCE_POINT_2 = new Vector2(-1.5, -0.1);

    /*************************************************************************
     **                                                                     **
     **                                 LENS                                **
     **                                                                     **
     *************************************************************************/

    var Lens = {};

    Lens.DEFAULT_INDEX_OF_REFRACTION = 1.5;
    Lens.DEFAULT_RADIUS_OF_CURVATURE = 1.5;

    Constants.Lens = Lens;



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




    return Constants;
});
