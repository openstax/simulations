define(function (require) {

    'use strict';

    var _ = require('underscore');

    var DispersionFunction = require('model/dispersion-function');

    var Constants = require('constants');

    /**
     * Holds information for a medium
     */
    var Medium = function(name, indexForRed, mystery, custom) {
        this.name = name;
        this.mystery = mystery;
        this.custom = custom;

        if (typeof indexForRed === 'function')
            this.dispersionFunction = indexForRed;
        else
            this.dispersionFunction = new DispersionFunction(indexForRed);
    };

    /**
     * Instance functions/properties
     */
    _.extend(Medium.prototype, {

        getIndexOfRefractionForRedLight: function() {
            return this.dispersionFunction.getIndexOfRefraction(Constants.WAVELENGTH_RED);
        }

    });

    return Medium;
});
