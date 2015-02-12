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


    return Constants;
});
