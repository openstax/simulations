define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    /**
     * Constants
     */
    var Constants = require('constants');


/*
 [[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]
 ]
 [ The original simulation model has us creating these
 [   objects every frame, which is really really bad.
 ]   I need to either figure out how to reuse them
 [   easily (with like an object pool or something) or
 [   make them really lightweight, or both
 [
 ][[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]
 */


    var LightRay = function() {

    };

    /**
     * Instance functions/properties
     */
    _.extend(LightRay.prototype, {


    });

    /**
     * Static functions/properties
     */
    _.extend(LightRay, {


    });

    return LightRay;
});