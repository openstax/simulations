define(function (require) {

    'use strict';

    var Disk = require('models/disk');

    var Constants = require('constants');

    var Photon = Disk.extend({

        defaults: _.extend({}, Disk.prototype.defaults, {
            mass: 1, // Mass of photons always 1

            wavelength: 1,
            energy:     0, // Calculated from the wavelength on initialization
            source:     null
        }),

        initialize: function(attributes, options) {
            Disk.prototype.initialize.apply(this, [attributes, options]);

            this.set('energy', Constants.h * Constants.C / this.get('wavelength'));
        },

        /**
         * Points the velocity by the angle theta.
         */
        setDirection: function(theta) {
            this.setVelocity(
                Constants.SPEED_OF_LIGHT * Math.cos(theta),
                Constants.SPEED_OF_LIGHT * Math.sin(theta)
            );
        }

    });

    return Photon;
});
