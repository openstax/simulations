define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Particle = require('./particle');

    /**
     * Because Backbone models only see shallow changes, we need to
     *   create new objects when assigning a new value to an attribute
     *   if we want the event system to pick up the change.  Creating
     *   and destroying objects is expensive in a real-time system,
     *   especially when it's happening each frame on a lot of objects,
     *   so we're going to use an object pool to reuse old objects
     *   instead of just throwing them away.
     */
    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    /**
     * A body with mass and momentum
     */
    var Photon = Particle.extend({

        defaults: _.extend({}, Particle.prototype.defaults, {
            lastColidedBody: null,
            theta: undefined,
            omega: undefined,
            alpha: undefined,
            prevAlpha: undefined,
            mass: undefined,
            momentum: undefined
        }),

        initialize: function(attributes, options) {
            Particle.prototype.initialize.apply(this, [attributes, options]);

            this.set('momentum', vectorPool.create().set(this.get('momentum')));
        },

        /**
         * 
         */
        update: function(deltaTime) {
            var alpha = this.get('alpha');
            var omega = this.get('omega');
            // New orientation
            this.set('theta', this.get('theta') + deltaTime * omega + deltaTime * deltaTime * alpha / 2);
            // New angular velocity
            this.set('omega', omega + deltaTime * (alpha + prevAlpha) / 2);
            // Track angular acceleration
            this.set('prevAlpha', alpha);

            Particle.prototype.update.apply(this, arguments);

            this.setMomentum(
                this.get('velocity').x * this.get('mass'),
                this.get('velocity').y * this.get('mass')
            );
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

        /**
         * Function that facilitates setting the momentum vector 
         *   while still triggering a change event.
         */
        setMomentum: function(x, y, options) {
            var oldMomentum = this.get('momentum');
            
            if (x instanceof Vector2)
                this.set('momentum', vectorPool.create().set(x), y);
            else
                this.set('momentum', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldMomentum);
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            Particle.prototype.destroy.apply(this, [options]);
            vectorPool.remove(this.get('momentum'));
        }

    });

    return Photon;
});