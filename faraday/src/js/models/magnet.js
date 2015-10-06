define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var FaradayObject = require('models/faraday-object');

    var AbstractMagnet = FaradayObject.extend({

        defaults: _.extend({}, FaradayObject.prototype.defaults, {
            width: 250,
            height: 50,
            strength: 1,
            minStrength: 0,                       // couldn't be any weaker
            maxStrength: Number.POSITIVE_INFINITY // couldn't be any stronger
        }),

        initialize: function(attributes, options) {
            FaradayObject.prototype.initialize.apply(this, arguments);

            this._relativePoint = new Vector2();

            this.on('change:minStrength', this.minStrengthChanged);
            this.on('change:maxStrength', this.maxStrengthChanged);
        },

        /**
         * Flips the magnet's polarity by rotating it 180 degrees.
         */
        flipPolarity: function() {
            this.set('direction', (this.get('direction') + Math.PI) % (2 * Math.PI));
        },

        /**
         * Gets the B-field vector at a point in the global 2D space.
         *
         * @param  Vector2 the point
         * @return Vector2 the B-field vector
         */
        getBField: function(point) {
            /* 
             * Our models are based a magnet located at the origin, with the north pole
             *   pointing down the positive x-axis.  The point we receive is in global
             *   space, so transform the point to the magnet's local coordinate system,
             *   adjusting for position and orientation.
             *
             * Original transform: translate(-x, -y), rotate(-direction, x, y).
             * The following should be the equivalent (because we don't have rotation
             *   about a point).
             */
            var relativePoint = this._relativePoint
                .set(point)
                .rotate(-this.get('direction'))
                .sub(this.get('position'));
                
            
            // Get strength in magnet's local coordinate frame
            var bField = this.getBFieldRelative(relativePoint);

            // Adjust the field vector to match the magnet's direction.
            bField.rotate(this.get('direction'));

            // Clamp magnitude to magnet strength.
            var magnetStrength = this.get('strength');
            var magnitude = bField.length();
            if (magnitude > magnetStrength)
                bField.scale(magnetStrength / magnitude);

            return bField;
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
        getBFieldRelative: function(point) {},

        /**
         * Makes sure the strength isn't less than minStrength and that maxStrength
         *   is greater than the minStrength.
         */
        minStrengthChanged: function(magnet, minStrength) {
            if (this.get('strength') < minStrength)
                this.set('strength', minStrength);

            if (minStrength > this.get('maxStrength'))
                this.set('maxStrength', minStrength);
        },

        /**
         * Makes sure the strength isn't greater than maxStrength and that minStrength
         *   is less than the maxStrength.
         */
        maxStrengthChanged: function(magnet, maxStrength) {
            if (this.get('strength') > maxStrength)
                this.set('strength', maxStrength);

            if (maxStrength < this.get('minStrength'))
                this.set('minStrength', maxStrength);
        }

    });

    return AbstractMagnet;
});
