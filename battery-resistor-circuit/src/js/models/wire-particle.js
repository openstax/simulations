define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * 
     */
    var WireParticle = function(attributes) {
        attributes = _.extend({
            mass:    1,
            charge: -1,

            position: 0,
            velocity: 0,
            acceleration: 0
        }, attributes);

        this.mass   = attributes.mass;
        this.charge = attributes.charge;

        this.position = options.position;
        this.velocity = options.velocity;
        this.acceleration = options.acceleration;

        this.propagator = options.propagator;
        this.wirePatch = options.wirePatch;
    };

    /**
     * Instance functions/properties
     */
    _.extend(WireParticle.prototype, {

        /**
         * Updates the particle by calling its propagator
         */
        update: function(deltaTime) {
            this.propagator.propagate(deltaTime, this);
        }

    });



    return WireParticle;
});
