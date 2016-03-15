define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2 = require('../math/vector2');

    var VanillaPositionableObject = require('./positionable-object-vanilla');

    /**
     * Uses the base of VanillaPositionableObject, which has a position vector
     *   as one of its attributes, and adds velocity and acceleration
     *   which can be used to calculate new positions.
     */
    var VanillaMotionObject = VanillaPositionableObject.extend({

        init: function() {
            VanillaPositionableObject.prototype.init.apply(this, arguments);

            this._vec2 = new Vector2(0, 0);
        },
        
        defaults: _.extend({}, VanillaPositionableObject.prototype.defaults, {
            velocity: null,
            acceleration: null
        }),

        onCreate: function(attributes, options) {
            VanillaPositionableObject.prototype.onCreate.apply(this, [attributes, options]);

            // Create new vectors
            this.set('velocity',     this.createVector2().set(this.get('velocity')));
            this.set('acceleration', this.createVector2().set(this.get('acceleration')));

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
        setVelocity: function(x, y) {
            if (x instanceof Vector2)
                this.get('velocity').set(x);
            else
                this.get('velocity').set(x, y);
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
        addVelocity: function(x, y) {
            if (x instanceof Vector2)
                this.get('velocity').add(x);
            else
                this.get('velocity').add(x, y);
        },

        getVelocity: function() {
            return this.get('velocity');
        },

        /**
         * Function that facilitates setting the acceleration vector 
         *   while still triggering a change event.
         */
        setAcceleration: function(x, y) {
            if (x instanceof Vector2)
                this.get('acceleration').set(x);
            else
                this.get('acceleration').set(x, y);
        },

        getAcceleration: function() {
            return this.get('acceleration');
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            if (!this.destroyed) {
                this.removeVector2(this.get('velocity'));
                this.removeVector2(this.get('acceleration'));
            }

            VanillaPositionableObject.prototype.destroy.apply(this, arguments);
        }

    });

    /**
     * Set function aliases
     */
    VanillaMotionObject.prototype.updateMotion = VanillaMotionObject.prototype.updatePositionAndVelocity;


    return VanillaMotionObject;
});
