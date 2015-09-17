define(function (require) {

    'use strict';

    var Pool = require('object-pool');

    var Vector2 = require('common/math/vector2');
    
    var pool = Pool({
        init: function() {
            return new Ray();
        }
    });

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Very lightweight version of the ray for the Prism Break tab
     *
     * Constructor parameters:
     *    tail, directionUnitVector, power, wavelength, mediumIndexOfRefraction, frequency
     *
     */
    var Ray = function() {
        this.tail = new Vector2();
        this.directionUnitVector = new Vector2();

        // Call init with any arguments passed to the constructor
        this.init.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(Ray.prototype, {

        /**
         * Initializes the Ray's properties with provided initial values
         */
        init: function(tail, directionUnitVector, power, wavelength, mediumIndexOfRefraction, frequency) {
            if (tail)
                this.tail.set(tail);
            else
                this.tail.set(0, 0);

            if (directionUnitVector)
                this.directionUnitVector.set(directionUnitVector);
            else
                this.directionUnitVector.set(0, 0);

            this.directionUnitVector.normalize();

            this.power = power;
            this.wavelength = wavelength;
            this.mediumIndexOfRefraction = mediumIndexOfRefraction;
            this.frequency = frequency;
        },

        /**
         * Gets the wavelength for this ray if it wasn't inside a medium
         */
        getBaseWavelength: function() {
            return Constants.SPEED_OF_LIGHT / this.frequency;
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
    _.extend(Ray, {

        /**
         * Initializes and returns a new Ray instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.
         */
        create: function() {
            var ray = pool.create();
            ray.init.apply(ray, arguments);
            return ray;
        }

    });


    return Ray;
});