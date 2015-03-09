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

    Constants.CANVAS_WIDTH = 960;
    Constants.CANVAS_HEIGHT = 720;
    Constants.GRID_SIZE = 15;
    Constants.GRID_OFFSET = 10;
    Constants.GRID_COLOR = '#e2e2e2';
    Constants.ARROWHEAD_HEIGHT = 20;
    Constants.VECTOR_Y_ROTATION = 4.733219300420907;
    Constants.VECTOR_X_ROTATION = 3.1415926536;
    Constants.X_OFFSET = 150;
    Constants.Y_OFFSET = 885;

    Constants.SNAPPING_FUNCTION = function(coordinateComponent) {
        return Math.round(coordinateComponent / 15) * 15;
    };

    return Constants;
});
