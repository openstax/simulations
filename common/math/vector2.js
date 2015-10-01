define(function (require) {

    'use strict';

    var Vector2 = require('vector2-node');

    /**
     * Returns a new unit vector in the direction specified by the angle
     */
    Vector2.fromAngle = function(angle) {
    	return new Vector2(1, 0).rotate(angle);
    };

    Vector2.prototype.toString = function(precision) {
        if (precision === undefined)
            precision = 4;
        return '(' + this.x.toFixed(precision) + ', ' + this.y.toFixed(precision) + ')';
    };

    /**
     * Rounds each component to the nearest integer.
     */
    Vector2.prototype.round = function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    };

    return Vector2;

});