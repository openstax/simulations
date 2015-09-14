define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var PositionableObject = require('common/models/positionable-object');
    var Vector2            = require('common/math/vector2');

    var Polygon = require('models/shape/polygon');

    /**
     * 
     */
    var Prism = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            rotation: 0
        }),

        /**
         * Initializes new Prism object.
         */
        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, [attributes, options]);

            if (options.shape)
                this.shape = options.shape;
            else if (options.points)
                this.shape = new Polygon(options.points, options.referencePointIndex);
            
            this._point = new Vector2();
        },

        /**
         * Returns whether a point falls within the prism's shape
         */
        contains: function(point) {
            return this.shape.contains(point);
        },

        /**
         * Compute the intersections of the specified ray with this polygon's edges
         */
        getIntersections: function(incidentRay) {
            // Convert to the shape's local coordinates
            var tail = incidentRay.tail;
            var intersections = this.shape.getIntersections(tail, incidentRay.directionUnitVector);
            
            return intersections;
        },

        /**
         * Clones this prism instance and returns it
         */
        clone: function() {
            return new Prism({ 
                position: this.get('position') 
            }, { 
                shape: this.shape.clone()
            });
        },

        /**
         * Rotates the shape in place
         */
        rotate: function(radians) {
            this.shape.translate(-this.get('position').x, -this.get('position').y);
            this.shape.rotate(radians);
            this.shape.translate(this.get('position').x, this.get('position').y);

            // Add the rotation amount to our rotation attribute
            this.set('rotation', this.get('rotation') + radians);
        },

        translate: function(dx, dy) {
            PositionableObject.prototype.translate.apply(this, arguments);

            this.shape.translate(dx, dy);
        }

    }, Prism);

    return Prism;
});
