define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * Holds information for a medium
     */
    var Medium = function(shape, mediumProperties, color) {
        this.shape = shape;
        this.mediumProperties = mediumProperties;
        this.color = color;
    };

    /**
     * Instance functions/properties
     */
    _.extend(Medium.prototype, {

        getIndexOfRefraction: function(wavelength) {
            return this.mediumProperties.dispersionFunction.getIndexOfRefraction(wavelength);
        }

    });

    return Medium;
});
