define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * There was way too much overhead using the Backbone event
     *   system with the original Photon class when there were
     *   that many photons in play. This one will be more plain
     *   and will need to be read from explicitly by views that
     *   want updated information from it.
     */
    var BasicPhoton = function(attributes) {
        attributes = _.extend({
            mass:   Constants.Photon.MASS,
            radius: Constants.Photon.RADIUS,
            wavelength: 1,
            source: null,

            alpha: 0,
            omega: 0,
            charge: 0
        }, attributes);

        this.mass       = attributes.mass;
        this.radius     = attributes.radius;
        this.wavelength = attributes.wavelength;
        this.source     = attributes.source;
        this.energy     = Constants.h * Constants.C / this.wavelength;

        this.alpha  = attributes.alpha;
        this.omega  = attributes.omega;
        this.charge = attributes.charge;

        this.position = new Vector2();
        this.velocity = new Vector2();

        // For internal use to avoid creating and destroying objects
        this._vec2 = new Vector2(0, 0);
    };

    /**
     * Instance functions/properties
     */
    _.extend(BasicPhoton.prototype, {

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

        /**
         * Points the velocity towards the angle theta with
         *   a magnitude of the speed of light.
         */
        setDirection: function(theta) {
            this.setVelocity(
                Constants.SPEED_OF_LIGHT * Math.cos(theta),
                Constants.SPEED_OF_LIGHT * Math.sin(theta)
            );
        },

        /**
         * Returns center of mass of the disk.
         */
        getCenterOfMass: function() {
            return this.position;
        },

        /**
         * Calculates and returns the moment of inertia.
         */
        getMomentOfInertia: function() {
            // PhET: MR^2 / 2. We assume mass is equal to area
            var radius = this.radius;
            var mass = radius * radius * Math.PI;
            return radius * radius * mass / 2;
        },

        /**
         * Determines the new state of the body using the Verlet method
         */
        update: function(deltaTime) {
            this.updatePositionFromVelocity(deltaTime);
        },

        /**
         * Updates position with a position function that only takes
         *   into account velocity and delta time, leaving out
         *   acceleration.
         */
        updatePositionFromVelocity: function(deltaTime, options) {
            this._vec2.set(this.velocity);
            this.translate(this._vec2.scale(deltaTime), options);
        },

        /**
         * Calculates and returns the body's kinetic energy.
         */
        getKineticEnergy: function() {
            return (this.mass * this.velocity.lengthSq() / 2) + 
                (this.getMomentOfInertia() * this.omega * this.omega / 2);
        }

    });

    /**
     * Static properties
     */
    _.extend(BasicPhoton, Constants.Photon);



    return BasicPhoton;
});
