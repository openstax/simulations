// add force and mass
define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2 = require('../math/vector2');

    var VanillaMotionObject = require('./motion-object-vanilla');

    /**
     * Extends the base of VanillaMotionObject to add force and mass.
     */
    var VanillaForceAndMotionObject = VanillaMotionObject.extend({
        
        defaults: _.extend({}, VanillaMotionObject.prototype.defaults, {
            force: null,
            mass: 1
        }),

        onCreate: function(attributes, options) {
            VanillaMotionObject.prototype.onCreate.apply(this, [attributes, options]);

            // Create new vectors
            this.set('force', this.createVector2().set(this.get('force')));
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
            if (x instanceof Vector2)
                this.get('force').set(x);
            else
                this.get('force').set(x, y);
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
            if (x instanceof Vector2)
                this.get('force').add(x);
            else
                this.get('force').add(x, y);
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            VanillaMotionObject.prototype.destroy.apply(this, arguments);
            this.removeVector2(this.get('force'));
        }

    });


    return VanillaForceAndMotionObject;
});
