define(function (require) {

    'use strict';

    var Vector2 = require('vector2-node');

    Vector2.prototype.toString = function(precision) {
        if (precision === undefined)
            precision = 4;
        return '(' + this.x.toFixed(precision) + ', ' + this.y.toFixed(precision) + ')';
    };

    return Vector2;

});