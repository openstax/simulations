define(function (require) {

    'use strict';

    var _ = require('underscore');

    var ReflectionStrategy = require('models/reflection-strategy');

    /**
     * A ReflectionStrategy that reflects photons whose wavelengths
     *   are between two cutoff points. Probably misnamed. It's really
     *   more of a notch.
     */
    var BandPassReflectionStrategy = function(cutoffLow, cutoffHigh) {
        ReflectionStrategy.apply(this, arguments);

        this.cutoffLow = cutoffLow;
        this.cutoffHigh = cutoffHigh;
    };

    _.extend(BandPassReflectionStrategy.prototype, ReflectionStrategy.prototype, {

        reflects: function(photon) {
            return (
                photon.get('wavelength') >= this.cutoffLow && 
                photon.get('wavelength') <= this.cutoffHigh
            );
        }

    });


    return BandPassReflectionStrategy;
});