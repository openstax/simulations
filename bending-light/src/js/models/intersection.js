define(function (require) {

    'use strict';

    var Pool = require('object-pool');

    var Vector2 = require('common/math/vector2');
    
    var pool = Pool({
        init: function() {
            return new Intersection();
        },
    });

    /**
     * Models the intersection between a light ray and an interface, needed so we 
     *   can optionally depict normals at each intersection.
     *
     * Constructor parameters:
     *    unitNormal, point
     *
     */
    var Intersection = function() {
        this.unitNormal = new Vector2();
        this.point = new Vector2();

        // Call init with any arguments passed to the constructor
        this.init.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(Intersection.prototype, {

        /**
         * Initializes the Intersection's properties with provided initial values
         */
        init: function(unitNormal, point) {
            if (unitNormal)
                this.unitNormal.set(unitNormal);
            else
                this.unitNormal.set(0, 0);

            if (point)
                this.point.set(point);
            else
                this.point.set(0, 0);
        },

        getPoint: function() {
            return this.point;
        },

        getUnitNormal: function() {
            return this.unitNormal;
        },

        /**
         * Releases this instance to the object pool.
         */
        destroy: function() {
            pool.remove(this);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(Intersection, {

        /**
         * Initializes and returns a new Intersection instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.
         */
        create: function() {
            var intersection = pool.create();
            intersection.init.apply(intersection, arguments);
            return intersection;
        }

    });


    return Intersection;
});