// add momentum and mass
define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2      = require('common/math/vector2');
    var Pool         = require('object-pool');
    var MotionObject = require('common/models/motion-object');

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
     * Represents a body with mass moving in space.
     */
    var Body = MotionObject.extend({
        
        defaults: _.extend({}, MotionObject.prototype.defaults, {
            momentum: null,
            mass: 1,
            theta: 0,
            omega: 0,
            alpha: 0,
            previousAlpha: 0
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            // Create new vectors
            this.set('momentum', vectorPool.create().set(this.get('momentum')));
        },

        update: function(time, deltaTime) {
            var dt = deltaTime;

            // New orientation
            this.set('theta', this.get('theta') + dt * omega + dt * dt * this.get('alpha') / 2);

            // New angular velocity
            this.set('omega', this.get('omega') + dt * (this.get('alpha') + this.get('previousAlpha')) / 2);

            // Track angular acceleration
            this.set('previousAlpha', this.get('alpha'));

            // New position
            this.updatePositionFromAcceleration(deltaTime);

            // New Velocity
            if (this.previousAccelerationX === undefined) {
                this.previousAccelerationX = this.get('acceleration').x;
                this.previousAccelerationY = this.get('acceleration').y;
            }
            this.setVelocity(
                this.get('velocity').x + dt * (this.get('acceleration').x + this.previousAccelerationX) / 2,
                this.get('velocity').y + dt * (this.get('acceleration').y + this.previousAccelerationY) / 2
            );

            // New acceleration
            this.previousAccelerationX = this.get('acceleration').x;
            this.previousAccelerationY = this.get('acceleration').y;

            // New momentum
            this.setMomentum(
                this.get('velocity').x * this.get('mass'),
                this.get('velocity').y * this.get('mass')
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
         * Sets just the momentum in the x direction.
         */
        setMomentumX: function(x) {
            this.setMomentum(x, this.get('momentum').y);
        },

        /**
         * Sets just the momentum in the y direction.
         */
        setMomentumY: function(y) {
            this.setMomentum(this.get('momentum').x, y);
        },

        /**
         * Kind of like translation but for momentum. Just adds the given
         *   vector to the current momentum.
         */
        addMomentum: function(x, y, options) {
            var oldMomentum = this.get('momentum');
            var newMomentum = vectorPool.create().set(this.get('momentum'));

            if (x instanceof Vector2)
                this.set('momentum', newMomentum.add(x), y);
            else
                this.set('momentum', newMomentum.add(x, y), options);
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldMomentum);
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            MotionObject.prototype.destroy.apply(this, [options]);
            vectorPool.remove(this.get('momentum'));
        },

        /**
         * Returns the total kinetic energy of the body, translational
         *   and rotational.
         */
        getKineticEnergy: function() {
            return (this.get('mass') * this.get('velocity').lengthSq() / 2) +
                this.getMomentOfInertia() * this.get('omega') * this.get('omega') / 2;
        },

        /**
         * Gets center of mass
         */
        getCenterOfMass: function() {},

        /**
         * Gets moment of inertia
         */
        getMomentOfInertia: function() {},

    });


    return Body;
});
