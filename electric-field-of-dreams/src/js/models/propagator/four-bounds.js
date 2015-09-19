define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Propagator = require('models/propagator');
    var NorthBouncePropagator = require('models/propagator/north');
    var SouthBouncePropagator = require('models/propagator/south');
    var EastBouncePropagator  = require('models/propagator/east');
    var WestBouncePropagator  = require('models/propagator/west');

    /**
     * Keeps a particle within four bounding walls.
     */
    var FourBoundsPropagator = function(x, y, w, h, distanceFromWall) {
        this.n = new NorthBouncePropagator(y,     distanceFromWall);
        this.s = new SouthBouncePropagator(y + h, distanceFromWall);
        this.e = new EastBouncePropagator( x + w, distanceFromWall);
        this.w = new WestBouncePropagator( x,     distanceFromWall);
    };

    /**
     * Instance functions/properties
     */
    _.extend(FourBoundsPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            this.n.propagate(deltaTime, particle);
            this.e.propagate(deltaTime, particle);
            this.w.propagate(deltaTime, particle);
            this.s.propagate(deltaTime, particle);
        }

    });

    return FourBoundsPropagator;
});
