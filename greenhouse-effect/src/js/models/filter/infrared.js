define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Filter = require('models/filter');

    /**
     * This filter filters out infrared wavelengths
     */
    var InfraredFilter = function() {
        Filter.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(InfraredFilter.prototype, Filter.prototype, {

        /**
         * Returns whether or not a certain wavelength passes
         *   through the filter.
         */
        passes: function(wavelength) {
            return wavelength < 800E-9 || wavelength > 1500E-9;
        }

    });

    return InfraredFilter;
});
