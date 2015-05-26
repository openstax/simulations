define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Disk = require('models/disk');

    var Constants = require('constants');

    var Photon = Disk.extend({

        defaults: _.extend({}, Disk.prototype.defaults, {
            mass:   Constants.Photon.MASS,
            radius: Constants.Photon.RADIUS,

            wavelength: 1,
            energy:     0, // Calculated from the wavelength on initialization
            source:     null
        }),

        initialize: function(attributes, options) {
            Disk.prototype.initialize.apply(this, [attributes, options]);
            
            this.set('energy', Constants.h * Constants.C / this.get('wavelength'));
        },

        /**
         * Points the velocity towards the angle theta with
         *   a magnitude of the speed of light.
         */
        setDirection: function(theta) {
            this.setVelocity(
                Constants.SPEED_OF_LIGHT * Math.cos(theta),
                Constants.SPEED_OF_LIGHT * Math.sin(theta)
            );
        }

    }, Constants.Photon);

    return Photon;
});
