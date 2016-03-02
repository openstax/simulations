define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2  = require('../math/vector2');
    var Pool     = require('object-pool');

    var PositionableObject = require('./positionable-object');

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
     * Uses the base of PositionableObject, which has a position vector
     *   as one of its attributes, and adds velocity and acceleration
     *   which can be used to calculate new positions.
     */
    var MotionObject = PositionableObject.extend({
        
        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            velocity: null,
            acceleration: null
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, [attributes, options]);

            // Create new vectors
            this.set('velocity',     vectorPool.create().set(this.get('velocity')));
            this.set('acceleration', vectorPool.create().set(this.get('acceleration')));

            // For internal use to avoid creating and destroying objects
            this._vec2 = new Vector2(0, 0);
        },

        /**
         * Updates position with a position function that only takes
         *   into account velocity and delta time, leaving out
         *   acceleration.
         */
        updatePositionFromVelocity: function(deltaTime, options) {
            this._vec2.set(this.get('velocity'));
            this.translate(this._vec2.scale(deltaTime), options);
        },

        /**
         * Updates position with a standard position function based
         *   on delta time and velocity and acceleration.
         */
        updatePositionFromAcceleration: function(deltaTime, options) {
            this._vec2.x = this.get('velocity').x * deltaTime + 0.5 * this.get('acceleration').x * deltaTime * deltaTime;
            this._vec2.y = this.get('velocity').y * deltaTime + 0.5 * this.get('acceleration').y * deltaTime * deltaTime;
            this.translate(this._vec2);
        },

        /**
         * Updates the velocity based on the acceleration and the
         *   delta time.
         */
        updateVelocity: function(deltaTime, options) {
            this._vec2.x = this.get('acceleration').x * deltaTime;
            this._vec2.y = this.get('acceleration').y * deltaTime;
            this.addVelocity(this._vec2, options);
        },

        /**
         * Just combines the calls for a common use case where we
         *   update the velocity based on the acceleration and
         *   time and then use velocity and acceleration and time
         *   to update the position of the object.
         */
        updatePositionAndVelocity: function(deltaTime, options) {
            this.updateVelocity(deltaTime, options);
            this.updatePositionFromAcceleration(deltaTime, options);
        },

        /**
         * An alias of updatePositionAndVelocity
         */
        updateMotion: null, // (Defined outside this extend function)

        /**
         * Function that facilitates setting the velocity vector 
         *   while still triggering a change event.
         */
        setVelocity: function(x, y, options) {
            var oldVelocity = this.get('velocity');
            
            if (x instanceof Vector2)
                this.set('velocity', vectorPool.create().set(x), y);
            else
                this.set('velocity', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldVelocity);
        },

        /**
         * Sets just the velocity in the x direction.
         */
        setVelocityX: function(x) {
            this.setVelocity(x, this.get('velocity').y);
        },

        /**
         * Sets just the velocity in the y direction.
         */
        setVelocityY: function(y) {
            this.setVelocity(this.get('velocity').x, y);
        },

        /**
         * Kind of like translation but for velocity. Just adds the given
         *   vector to the current velocity.
         */
        addVelocity: function(x, y, options) {
            var oldVelocity = this.get('velocity');
            var newVelocity = vectorPool.create().set(this.get('velocity'));

            if (x instanceof Vector2)
                this.set('velocity', newVelocity.add(x), y);
            else
                this.set('velocity', newVelocity.add(x, y), options);
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldVelocity);
        },

        getVelocity: function() {
            return this.get('velocity');
        },

        /**
         * Function that facilitates setting the acceleration vector 
         *   while still triggering a change event.
         */
        setAcceleration: function(x, y, options) {
            var oldAcceleration = this.get('acceleration');
            
            if (x instanceof Vector2)
                this.set('acceleration', vectorPool.create().set(x), y);
            else
                this.set('acceleration', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldAcceleration);
        },

        getAcceleration: function() {
            return this.get('acceleration');
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            PositionableObject.prototype.destroy.apply(this, [options]);
            vectorPool.remove(this.get('velocity'));
            vectorPool.remove(this.get('acceleration'));
        }

    });

    /**
     * Set function aliases
     */
    MotionObject.prototype.updateMotion = MotionObject.prototype.updatePositionAndVelocity;


    return MotionObject;
});
