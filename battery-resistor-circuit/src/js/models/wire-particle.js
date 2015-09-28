define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * This is a particle that is only used in the wire system part of the
     *   simulation and doesn't have a direct representation in the scene.
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

        this.position = attributes.position;
        this.velocity = attributes.velocity;
        this.acceleration = attributes.acceleration;

        this.propagator = attributes.propagator;
        this.wirePatch = attributes.wirePatch;
    };

    /**
     * Instance functions/properties
     */
    _.extend(WireParticle.prototype, {

        /**
         * Updates the particle by calling its propagator
         */
        propagate: function(deltaTime) {
            this.propagator.propagate(deltaTime, this);
        }

    });



    return WireParticle;
});
