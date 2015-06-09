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
    Constants.CANVAS_HEIGHT = 601;
    Constants.GRID_SIZE = 15;
    Constants.GRID_ORIGIN_X = 5; // From left
    Constants.GRID_ORIGIN_Y = 5; // From bottom
    Constants.SHORT_GRID_ORIGIN_X = 3; // From left
    Constants.SHORT_GRID_ORIGIN_Y = 3; // From bottom
    Constants.GRID_COLOR = '#e2e2e2';
    Constants.ARROWHEAD_HEIGHT = 20;
    Constants.X_OFFSET = 150;
    Constants.Y_OFFSET = 885;

    Constants.SNAPPING_FUNCTION = function(coordinateComponent) {
        return Math.round(coordinateComponent / 15) * 15;
    };

    return Constants;
});
