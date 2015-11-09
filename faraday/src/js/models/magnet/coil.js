define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var AbstractMagnet = require('models/magnet');

    /**
     * CoilMagnet is the model of a coil magnet.
     * The shape of the model is a circle, and the calculation of the magnetic field
     * at some point of interest varies depending on whether the point is inside or
     * outside the circle.
     */
    var CoilMagnet = AbstractMagnet.extend({

        initialize: function(attributes, options) {
            AbstractMagnet.prototype.initialize.apply(this, arguments);

            this.modelShape = new Rectangle();

            this._bField = new Vector2();

            this.on('change:width change:height', this.dimensionsChanged);
        },

        dimensionsChanged: function() {
            this.modelShape.x = -this.get('width') / 2; 
            this.modelShape.y = -this.get('height') / 2;
            this.modelShape.w = this.get('width');
            this.modelShape.h = this.get('height');
        },

        /**
         * Returns whether the specified point is inside the magnet.
         */
        isInside: function(point) {
            return this.modelShape.contains(point);
        },

        /**
         * Gets the B-field vector at a point in the magnet's local 2D coordinate frame.
         *   In the magnet's local 2D coordinate frame, it is located at (0,0), and its
         *   north pole is pointing down the positive x-axis.
         *
         * @param Vector2 the point
         * @param Vector2 B-field is written here if provided, may NOT be null
         * @return Vector2
         */
        getBFieldRelative: function(point) {
            // Algorithm differs depending on whether we're inside or outside the shape that defines the coil.
            if (this.isInside(point))
                return this.getBFieldInside(point);
            else
                return this.getBFieldOutside(point);
        },

        /*
         * Gets the B-field vector for points inside the coil.
         * Inside the coil (r <= R) :
         *   Bx = (2 * m) / R^e = magnet strength
         *   By = 0
         */
        getBFieldInside: function(point) {
            return this._bField.set(
                Math.cos(0) * this.get('strength'), 
                Math.sin(0) * this.get('strength')
            );
        },

        /*
        * Gets the B-field vector for points outside the coil.
        *
        * Algorithm courtesy of Mike Dubson (dubson@spot.colorado.edu).
        * 
        * Terminology:
        *   axes oriented with +X right, +Y up
        *   origin is the center of the coil, at (0,0)
        *   (x,y) is the point of interest where we are measuring the magnetic field
        *   C = a fudge factor, set so that the lightbulb will light
        *   m = magnetic moment = C * #loops * current in the coil
        *   R = radius of the coil
        *   r = distance from the origin to (x,y)
        *   theta = angle between the X axis and (x,y)
        *   Bx = X component of the B field
        *   By = Y component of the B field
        *   e is the exponent that specifies how the field decreases with distance (3 in reality)
        * 
        * Outside the coil (r > R) :
        *   Bx = ( m / r^e ) * ( ( 3 * cos(theta) * cos(theta) ) - 1 )
        *   By = ( m / r^e ) * ( 3 * cos(theta) * sin(theta) )
        *   where:
        *     r = sqrt( x^2 + y^2 )
        *     cos(theta) = x / r
        *     sin(theta) = y / r
        *
        */
        getBFieldOutside: function(point) {
            // Elemental terms
            var x = point.x;
            var y = point.y;
            var r = Math.sqrt((x * x) + (y * y));
            var R = this.get('width') / 2;
            var distanceExponent = 3;

            /*
             * Inside the magnet, Bx = magnet strength = (2 * m) / (R^3).
             * Rewriting this gives us m = (magnet strength) * (R^3) / 2.
             */
            var m = this.get('strength') * Math.pow(R, distanceExponent) / 2;

            // Recurring terms
            var C1 = m / Math.pow(r, distanceExponent);
            var cosTheta = x / r;
            var sinTheta = y / r;

            // B-field component vectors
            var Bx = C1 * ((3 * cosTheta * cosTheta) - 1);
            var By = C1 * (3 * cosTheta * sinTheta);

            // B-field vector
            var bField = this._bField;
            bField.x = Bx;
            bField.y = By;

            return bField;
        }

    });

    return CoilMagnet;
});
