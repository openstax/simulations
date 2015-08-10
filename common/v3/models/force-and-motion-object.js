// add force and mass
define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2  = require('../math/vector2');
    var Pool     = require('object-pool');

    var MotionObject = require('./motion-object');

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
     * Extends the base of MotionObject to add force and mass.
     */
    var ForceAndMotionObject = MotionObject.extend({
        
        defaults: _.extend({}, MotionObject.prototype.defaults, {
            force: null,
            mass: 1
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            // Create new vectors
            this.set('force', vectorPool.create().set(this.get('force')));
        },


        /**
         * Updates acceleration from force and mass.
         */
        updateAcceleration: function(options) {
        	this._vec2.set(this.get('force'));
            this.setAcceleration(this._vec2.scale(1 / this.get('mass')), options);
        },

        /**
         * Updates force from acceleration and mass.
         */
        updateForce: function(options) {
        	this._vec2.set(this.get('acceleration'));
            this.setForce(this._vec2.scale(this.get('mass')), options);
        },

        /**
         * Function that facilitates setting the force vector 
         *   while still triggering a change event.
         */
        setForce: function(x, y, options) {
            var oldForce = this.get('force');
            
            if (x instanceof Vector2)
                this.set('force', vectorPool.create().set(x), y);
            else
                this.set('force', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldForce);
        },

        /**
         * Sets just the force in the x direction.
         */
        setForceX: function(x) {
            this.setForce(x, this.get('force').y);
        },

        /**
         * Sets just the force in the y direction.
         */
        setForceY: function(y) {
            this.setForce(this.get('force').x, y);
        },

        /**
         * Kind of like translation but for force. Just adds the given
         *   vector to the current force.
         */
        addForce: function(x, y, options) {
            var oldForce = this.get('force');
            var newForce = vectorPool.create().set(this.get('force'));

            if (x instanceof Vector2)
                this.set('force', newForce.add(x), y);
            else
                this.set('force', newForce.add(x, y), options);
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldForce);
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            MotionObject.prototype.destroy.apply(this, [options]);
            vectorPool.remove(this.get('force'));
        }

    });


    return ForceAndMotionObject;
});
