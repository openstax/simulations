define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var range     = require('common/math/range');


    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    var Constants = {};

    Constants.GRID_SIZE = 10;
    Constants.GRID_OFFSET = 5;
    Constants.ARROWHEAD_HEIGHT = 20;
    Constants.VECTOR_Y_ROTATION = 4.733219300420907;
    Constants.VECTOR_X_ROTATION = 3.1415926536;
    Constants.X_OFFSET = 50;
    Constants.Y_OFFSET = 910;


    return Constants;
});
