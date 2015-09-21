define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var BoundsBouncePropagator = require('models/propagator/bounds-bounce');

    /**
     * 
     */
    var WestBouncePropagator = function(xMin, distFromWall) {
        this.xMin = xMin;
        this.distFromWall = distFromWall;

        this._vec = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(WestBouncePropagator.prototype, BoundsBouncePropagator.prototype, {

        isOutOfBounds: function(position) {
            return position.x < this.xMin;
        },

        getPointAtBounds: function(oldPosition) {
            return this._vec.set(this.xMin + this.distFromWall, oldPosition.y);
        },
        
        getNewVelocity: function(oldVelocity) {
            var x = Math.abs(oldVelocity.x);
            return this._vec.set(x, oldVelocity.y);
        }

    });

    return WestBouncePropagator;
});
