define(function (require) {

    'use strict';

    var PositionableObject = require('common/models/positionable-object');
    var Vector2            = require('common/math/vector2');

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

    var Constants = require('constants');

    /**
     * This class represents an object (indirect light source) or direct
     *   light source that will be projected or seen through a lens with
     *   two points of interest whose rays we will track through the
     *   lens and onto a projected image (or screen). 
     */
    var SourceObject = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            height: 0,     // Meters
            upright: true, // Whether or not the object is right-side-up

            // TODO: In view, if type === Types.LIGHT, remove point2's x constraint.
            type: Constants.SourceObject.DEFAULT_TYPE,

            point1: null,
            point2: null
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, arguments);

            this.set('point1', vectorPool.create().set(this.get('point1')));
            this.set('point2', vectorPool.create().set(this.get('point2')));
        },

        /**
         * Function that facilitates setting point1 while still
         *   triggering a change event.
         */
        setPoint1: function(x, y, options) {
            var oldPoint = this.get('point1');
            
            if (x instanceof Vector2)
                this.set('point1', vectorPool.create().set(x), y);
            else
                this.set('point1', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPoint);
        },

        /**
         * Function that facilitates setting point2 while still
         *   triggering a change event.
         */
        setPoint1: function(x, y, options) {
            var oldPoint = this.get('point2');
            
            if (x instanceof Vector2)
                this.set('point2', vectorPool.create().set(x), y);
            else
                this.set('point2', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPoint);
        },

        /** 
         * Avoid memory leaks from the pool.
         */
        destroy: function(options) {
            PositionableObject.prototype.destroy.apply(this, [options]);
            vectorPool.remove(this.get('point1'));
            vectorPool.remove(this.get('point2'));
        }

    });

    return SourceObject;
});
