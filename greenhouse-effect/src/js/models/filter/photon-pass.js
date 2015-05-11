define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Filter = require('models/filter');
    var ProbabilisticPassFilter = require('models/filter/probabilistic-pass');

    /**
     * A filter model for the clouds likelihood of reflecting light of a specified wavelength
     * If the filter *passes* the wavelength, that means the cloud will reflect the photon
     */
    var PhotonPassFilter = function() {
        Filter.apply(this, arguments);

        this.visibleLightFilter = new ProbabilisticPassFilter(0.4);
    };

    /**
     * Instance functions/properties
     */
    _.extend(PhotonPassFilter.prototype, Filter.prototype, {

        /**
         * Returns whether or not a certain wavelength passes
         *   through the filter.
         */
        passes: function(wavelength) {
            // If wavelength is in the IR, it never passes
            if (wavelength >= 800E-9)
                return true;
            else
                return this.visibleLightFilter.passes(wavelength);
        }

    });

    return PhotonPassFilter;
});
