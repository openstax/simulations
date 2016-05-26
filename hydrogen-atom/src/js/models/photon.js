define(function (require) {

    'use strict';

    var _ = require('underscore');

    var WavelengthColors = require('common/colors/wavelength');

    var MovingObject = require('hydrogen-atom/models/moving-object');
    
    var Constants = require('constants');

    /**
     * Photon is the model of a photon.
     * A photon has a position and direction of motion.
     * It also has an immutable wavelength.
     * Photons move with constant speed.
     */
    var Photon = MovingObject.extend({

        defaults: _.extend({}, MovingObject.prototype.defaults, {
            // Photon's wavelength, immutable
            wavelength: undefined,
            // Was the photon emitted by the atom? immutable, used by collision detection
            emitted: false,
            // Did the photon already collide with the atom
            collided: false
        }),

        initialize: function(attributes, options) {
            MovingObject.prototype.initialize.apply(this, [attributes, options]);

            
        },

        /**
         * Gets the photon's wavelength.
         */
        getWavelength: function() {
            return this.get('wavelength');
        },
        
        /**
         * Gets the Color associated with the photon's wavelength.
         */
        getColor: function() {
            var wavelength = this.get('wavelength');
            var color;

            if (wavelength === Constants.WHITE_WAVELENGTH) {
                // Special case: white light.
                color = Color.WHITE;
            }
            else if (wavelength < WavelengthColors.MIN_WAVELENGTH) {
                color = Constants.UV_COLOR;
            }
            else if (wavelength > WavelengthColors.MAX_WAVELENGTH) {
                color = Constants.IR_COLOR;
            }
            else {
                color = WavelengthColors.nmToHex(wavelength);
            }

            return color;
        },
        
        /**
         * Was this photon emitted by the atom?
         */
        isEmitted: function() {
            return this.get('emitted');
        },
        
        /**
         * Did this photon collide with the atom?
         */
        isCollided: function() {
            return this.get('collided');
        },

        update: function(time, deltaTime) {}

    });

    return Photon;
});