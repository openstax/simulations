define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var Body = require('models/body');

    /**
     * Model representation of an annulus, which is like a
     *   a ring with thickness or a 2D version of a torus.
     */
    var Annulus = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            center: null,
            innerDiameter: 0,
            outerDiameter: 0
        }),

        initialize: function(attributes, options) {
            Body.prototype.initialize.apply(this, [attributes, options]);

            this.set('center', new Vector2(this.get('center')));
        },

        /**
         * Returns the distance from a point to the inner 
         *   diameter of the annulus.
         */
        distanceFromInnerDiameter: function(point) {
            return Math.abs(point.distance(this.get('center')) - (this.get('innerDiameter') / 2));
        },

        /**
         * Returns center of mass of the annulus.
         */
        getCenterOfMass: function() {
            return this.get('center');
        },

        /**
         * Calculates and returns the moment of inertia.
         */
        getMomentOfInertia: function() {
            return (Math.PI / 4) * (
                Math.pow(this.get('outerDiameter'), 4) - Math.pow(this.get('innerDiameter'), 4)
            );
        }

    });

    return Annulus;
});