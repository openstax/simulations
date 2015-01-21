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

    Constants.GRAVITY = 9.8; // m/s^2
    Constants.AIR_DENSITY_AT_SEA_LEVEL = 1.6; // kg/m^3


    return Constants;
});
