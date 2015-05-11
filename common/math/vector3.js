define(function (require) {

    'use strict';

    var Vector3 = require('vec3-shimmed');

    Vector3.prototype.subtract = Vector3.prototype.sub;
    Vector3.prototype.scale    = Vector3.prototype.mul;
    Vector3.prototype.length   = Vector3.prototype.mag;
    Vector3.prototype.lengthSq = Vector3.prototype.sqmag;
    Vector3.prototype.normal   = Vector3.prototype.norm;

    return Vector3;

});