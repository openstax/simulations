define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Vector2 = require('../math/vector2');
    var Pool    = require('object-pool');

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
    var PositionableObject = Backbone.Model.extend({

        defaults: {
            position: null
        },
        
        initialize: function(attributes, options) {
            // Create vectors
            this.set('position', vectorPool.create().set(this.get('position')));

            this._offsetPosition = new Vector2();
        },

        setX: function(x) {
            this.setPosition(x, this.get('position').y);
        },

        setY: function(y) {
            this.setPosition(this.get('position').x, y);
        },

        translate: function(x, y, options) {
            var oldPosition = this.get('position');
            var newPosition = vectorPool.create().set(this.get('position'));

            if (x instanceof Vector2)
                this.set('position', newPosition.add(x));
            else
                this.set('position', newPosition.add(x, y), options);
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPosition);
        },

        setPosition: function(x, y, options) {
            var oldPosition = this.get('position');
            //console.log(vectorPool.list.length);
            
            if (x instanceof Vector2)
                this.set('position', vectorPool.create().set(x));
            else
                this.set('position', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPosition);
        },

        offsetPosition: function(offset) {
            return this._offsetPosition.set(this.get('position')).add(offset);
        },

        /**
         * We need to make sure we release the model's vector
         *   back into the vector pool or we get memory leaks,
         *   so destroy must be called on all positionable
         *   objects when we're done with them.
         */
        destroy: function(options) {
            this.trigger('destroy', this, this.collection, options);
            vectorPool.remove(this.get('position'));
        }

    });

    return PositionableObject;
});
