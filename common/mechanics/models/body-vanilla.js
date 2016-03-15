define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var VanillaParticle = require('./particle-vanilla');

    /**
     * A body with mass and momentum
     */
    var VanillaBody = VanillaParticle.extend({

        defaults: _.extend({}, VanillaParticle.prototype.defaults, {
            lastColidedBody: null,
            theta: 0,
            omega: 0,
            alpha: 0,
            prevAlpha: 0,
            mass: 0
        }),

        init: function() {
            VanillaParticle.prototype.init.apply(this, arguments);

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

            VanillaParticle.prototype.update.apply(this, arguments);
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
        setMomentum: function(x, y) {
            if (x instanceof Vector2)
                this.setVelocity(x.x / this.get('mass'), x.y / this.get('mass'));
            else
                this.setVelocity(x / this.get('mass'), y / this.get('mass'));
        }

    });

    return VanillaBody;
});