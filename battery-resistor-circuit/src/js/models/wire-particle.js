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
            charge: -1
        }, attributes);

        this.mass   = attributes.mass;
        this.charge = attributes.charge;

        this.position     = new Vector2(options.position);
        this.velocity     = new Vector2(options.velocity);
        this.acceleration = new Vector2(options.acceleration);

        this.propagator = options.propagator;
        this.wirePatch = options.wirePatch;
    };

    /**
     * Instance functions/properties
     */
    _.extend(WireParticle.prototype, {

        /**
         * I want it to act like the original photon externally
         *   so I don't need to change as much code, so I'm 
         *   writing get and set functions.
         */
        get: function(attr) {
            return this[attr];
        },

        /**
         * See documentation for `get` function.
         */
        set: function(attr, value) {
            this[attr] = value;
        },

        setPosition: function(x, y) {
            this.position.set(x, y);
        },

        translate: function(dx, dy) {
            this.position.add(dx, dy);
        },

        setVelocity: function(vx, vy) {
            this.velocity.set(vx, vy);
        },

        addVelocity: function(dvx, dvy) {
            this.velocity.add(dvx, dvy);
        },

        setAcceleration: function(ax, ay) {
            this.acceleration.set(ax, ay);
        },

        addAcceleration: function(dax, day) {
            this.acceleration.add(dax, day);
        },

        /**
         * Updates the particle by calling its propagator
         */
        update: function(deltaTime) {
            this.propagator.propagate(deltaTime, this);
        }

    });



    return WireParticle;
});
