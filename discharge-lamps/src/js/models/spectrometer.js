define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    /**
     * Counts photons according to their wavelengths
     */
    var Spectrometer = Backbone.Model.extend({

        defaults: {
            running: false
        },

        initialize: function(attributes, options) {

            this.wavelengthToPhotonNumberMap = {};

        },

        getCountAtWavelength: function(wavelength) {
            var count = this.wavelengthToPhotonNumberMap['' + wavelength];
            return (count ? count : 0);
        },

        start: function() {
            this.set('running', true);
        },

        stop: function() {
            this.set('running', false);
        },

        reset: function() {
            this.wavelengthToPhotonNumberMap = {};
        },

        /**
         * Bumps the count of photons that have the wavelength of the emitted photon
         */
        photonEmitted: function(model, photon) {
            if (this.get('running')) {
                var wavelength = photon.getWavelength();
                var photonCount = this.getCountAtWavelength(wavelength);
                var cnt = 0;
                if (_.isNumber(photonCount))
                    cnt = photonCount;
                
                cnt++;
                this.wavelengthToPhotonNumberMap['' + wavelength] = cnt;
            }
        }

    });


    return Spectrometer;
});
