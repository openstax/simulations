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

    Constants.SIMULATION_BOUNDS = new Rectangle(0, 0, 1000, 700);
    Constants.SIMULATION_ORIGIN = new Vector2(108, 325);

    return Constants;
});
