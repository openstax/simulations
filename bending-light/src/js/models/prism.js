define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var PositionableObject = require('common/models/positionable-object');
    var Vector2            = require('common/math/vector2');

    /**
     * 
     */
    var Prism = PositionableObject.extend({

        /**
         * Initializes new Prism object.
         */
        initialize: function(attributes, options) {
            if (options.shape)
                this.shape = options.shape;
            else if (options.points)
                this.shape = new Polygon(options.points, options.referencePointIndex);
            
            this._point = new Vector2();

            this.on('change:position', this.positionChanged);
        },

        /**
         * Returns whether a point falls within the prism's shape
         */
        contains: function(point) {
            // Translate the point because the shape is centered on its
            //   own pivot point which should correspond to the position.
            point = this._point.set(point).add(this.get('position'));

            return this.shape.contains(point);
        },

        /**
         * Compute the intersections of the specified ray with this polygon's edges
         */
        getIntersections: function(incidentRay) {
            return this.shape.getIntersections(incidentRay);
        },

        /**
         * Clones this prism instance and returns it
         */
        clone: function() {
            return new Prism({ 
                position: this.get('position') 
            }, { 
                shape: this.shape 
            });
        },

        /**
         * Rotates the shape in place
         */
        rotate: function(rotate) {
            this.shape.rotate(rotate);
        },

        positionChanged: function(prism, position) {
            this.shape.translate(position);
        }

    }, Prism);

    return Prism;
});
