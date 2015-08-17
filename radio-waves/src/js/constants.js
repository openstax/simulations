define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SPEED_OF_LIGHT = 6;

    Constants.MODEL_BOUNDS = new Rectangle(125, 300, 1000, 700);

    return Constants;
});
