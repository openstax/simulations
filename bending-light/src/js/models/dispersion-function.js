define(function (require) {

    'use strict';

    var _ = require('underscore');

    var clamp = require('common/math/clamp');

    var Constants = require('constants');

    /**
     * Original PhET documentation by Sam Reid:
     *   Models dispersion functions for each material.  Uses the actual dispersion
     *   equation for air (A) and the actual dispersion equation for glass (G) then
     *   interpolates between the functions 
     *             n(lambda) = beta * A(lambda) + (1-beta) * G(lambda) 
     *   where 0<=beta<=infinity is a characteristic of the material.  The material
     *   is characterized by a reference wavelength, so that when light is the
     *   specified wavelength, the index of refraction takes the reference value.
     */
    var DispersionFunction = function(referenceIndexOfRefraction, wavelength) {
        this.referenceIndexOfRefraction = referenceIndexOfRefraction;
        // If only the reference index of refraction is given, we assume it's
        //   the index of refraction for the red wavelength.
        this.referenceWavelength = (wavelength !== undefined) ? wavelength : Constants.WAVELENGTH_RED;
    };

    /**
     * Instance functions/properties
     */
    _.extend(DispersionFunction.prototype, {

        getIndexOfRefractionForRed: function() {
            return this.getIndexOfRefraction(Constants.WAVELENGTH_RED);
        },

        /**
         * See class-level documentation for an explanation of this algorithm
         */
        getIndexOfRefraction: function(wavelength) {
            // Get the reference values
            var nAirReference = DispersionFunction.getAirIndex(this.referenceWavelength);
            var nGlassReference = DispersionFunction.getSellmeierValue(this.referenceWavelength);

            // Determine the mapping and make sure it is in a good range
            var delta = nGlassReference - nAirReference;
            var x = (this.referenceIndexOfRefraction - nAirReference) / delta; // 0 to 1 (air to glass)
            x = clamp(0, x, Number.POSITIVE_INFINITY);

            // Take a linear combination of glass and air equations
            var index = x * DispersionFunction.getSellmeierValue(wavelength) + (1 - x) * DispersionFunction.getAirIndex(wavelength);
            return index;
        },

        setIndexOfRefraction: function(indexOfRefraction) {
            this.referenceIndexOfRefraction = indexOfRefraction;
        },

        setReferenceWavelength: function(wavelength) {
            this.referenceWavelength = wavelength;
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(DispersionFunction, {

        /**
         * See http://en.wikipedia.org/wiki/Sellmeier_equation
         */
        getSellmeierValue: function(wavelength) {
            var L2 = wavelength * wavelength;
            var B1 = 1.03961212;
            var B2 = 0.231792344;
            var B3 = 1.01046945;
            var C1 = 6.00069867E-3 * 1E-12; // Convert to metric
            var C2 = 2.00179144E-2 * 1E-12;
            var C3 = 1.03560653E2 * 1E-12;
            return Math.sqrt(1 + B1 * L2 / (L2 - C1) + B2 * L2 / (L2 - C2) + B3 * L2 / (L2 - C3));
        },

        /**
         * See http://refractiveindex.info/?group=GASES&material=Air
         */
        getAirIndex: function(wavelength) {
            return 1 + 5792105E-8 / (238.0185 - Math.pow(wavelength * 1E6, -2)) + 167917E-8 / (57.362 - Math.pow(wavelength * 1E6, -2));
        }

    });

    return DispersionFunction;
});
