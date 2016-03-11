define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');
    var Vector2      = require('common/math/vector2');
    var PooledObject = require('common/pooled-object/pooled-object');

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
     * Represents an object in 2D space and provides some helper functions
     *   for changing a position vector in a way that leverages Backbone's
     *   event system.
     */
    var VanillaPositionableObject = PooledObject.extend({

        /**
         * Initializes the VanillaPositionableObject's properties with provided initial values
         */
        init: function(attributes, options) {
            this.position = vectorPool.create().set(attributes.position);

            this._offsetPosition = vectorPool.create();
        },

        get: function(key) {
            return this[key];
        },

        getX: function(x) {
            return this.position.x;
        },

        getY: function(y) {
            return this.position.y;
        },

        setX: function(x) {
            this.setPosition(x, this.position.y);
        },

        setY: function(y) {
            this.setPosition(this.position.x, y);
        },

        translate: function(x, y) {
            if (x instanceof Vector2)
                this.position.add(x);
            else
                this.position.add(x, y);
        },

        setPosition: function(x, y, options) {
            if (x instanceof Vector2)
                this.position.set(x);
            else
                this.position.set(x, y);
        },

        offsetPosition: function(offset) {
            return this._offsetPosition.set(this.position).add(offset);
        },

        getPosition: function() {
            return this.position;
        },

        /**
         * We need to make sure we release the model's vector
         *   back into the vector pool or we get memory leaks,
         *   so destroy must be called on all positionable
         *   objects when we're done with them.
         */
        destroy: function(options) {
            // Make sure the collection knows we destroyed it
            if (this.collection)
                this.collection.alertDestroyed(this);

            vectorPool.remove(this.position);
            vectorPool.remove(this._offsetPosition);
        }

    });


    return VanillaPositionableObject;
});