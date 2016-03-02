define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Particle = require('./particle');

    /**
     * A body with mass and momentum
     */
    var Body = Particle.extend({

        defaults: _.extend({}, Particle.prototype.defaults, {
            lastColidedBody: null,
            theta: undefined,
            omega: undefined,
            alpha: undefined,
            prevAlpha: undefined,
            mass: undefined
        }),

        initialize: function(attributes, options) {
            Particle.prototype.initialize.apply(this, [attributes, options]);

            this._momentum = new Vector2();
        },

        /**
         * 
         */
        update: function(deltaTime) {
            var alpha = this.get('alpha');
            var omega = this.get('omega');
            var prevAlpha = this.get('prevAlpha');
            
            // New orientation
            this.set('theta', this.get('theta') + deltaTime * omega + deltaTime * deltaTime * alpha / 2);
            // New angular velocity
            this.set('omega', omega + deltaTime * (alpha + prevAlpha) / 2);
            // Track angular acceleration
            this.set('prevAlpha', alpha);

            Particle.prototype.update.apply(this, arguments);
        },

        getCM: function() {
            throw 'Must be implemented in child class';
        },

        getMomentOfInertia: function() {
            throw 'Must be implemented in child class';
        },

        /**
         * Returns the total kinetic energy of the body, translational
         * and rotational
         *
         * @return the kinetic energy
         */
        getKineticEnergy: function() {
            return (
                (this.get('mass') * this.get('velocity').lengthSq() / 2) +
                (this.getMomentOfInertia() * this.get('omega') * this.get('omega') / 2)
            );
        },

        getMomentum: function() {
            return this._momentum.set(
                this.get('velocity').x * this.get('mass'),
                this.get('velocity').y * this.get('mass')
            );
        },

        /**
         * Function that facilitates setting the momentum vector 
         *   while still triggering a change event.
         */
        setMomentum: function(x, y, options) {
            if (x instanceof Vector2)
                this.setVelocity(x.x / this.get('mass'), x.y / this.get('mass'), y);
            else
                this.setVelocity(x / this.get('mass'), y / this.get('mass'), options);
        }

    });

    return Body;
});