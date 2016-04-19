define(function (require) {

    'use strict';

    var range   = require('common/math/range');
    var Vector2 =require('common/math/vector2');

    var NucleusType  = require('models/nucleus-type');
    var HalfLifeInfo = require('models/half-life-info');

    var Constants = require('nuclear-physics/constants'); 

    Constants.FRAME_RATE = 25;
    Constants.DELTA_TIME_PER_FRAME = 40;



    return Constants;
});
