define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var BoundsBouncePropagator = require('models/propagator/bounds-bounce');

    /**
     * 
     */
    var EastBouncePropagator = function(xMax, distFromWall) {
        this.xMax = xMax;
        this.distFromWall = distFromWall;

        this._vec = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(EastBouncePropagator.prototype, BoundsBouncePropagator.prototype, {

        isOutOfBounds: function(position) {
            return position.x > this.xMax;
        },

        getPointAtBounds: function(oldPosition) {
            // TODO: See if this is a mistake in the original. I think it's supposed to be this.xMax - this.distFromWall
            return this._vec.set(this.xMax, oldPosition.y);
        },
        
        getNewVelocity: function(oldVelocity) {
            var x = -Math.abs(oldVelocity.x);
            return this._vec.set(x - this.distFromWall, oldVelocity.y);
        }

    });

    return EastBouncePropagator;
});
