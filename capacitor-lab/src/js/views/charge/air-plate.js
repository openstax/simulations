define(function(require) {

    'use strict';

    var PlateChargeView = require('views/charge/plate');

    /**
     * Portion of the plate charge due to the dielectric. Charges appear on
     *   the portion of the plate that is in contact with the dielectric.
     */
    var AirPlateChargeView = PlateChargeView.extend({

        /**
         * Gets the portion of the plate charge due to air.
         */
        getPlateCharge: function() {
            return this.model.getAirPlateCharge();
        },

        /**
         * Gets the x offset (relative to the plate origin) of the portion of the
         *   plate that is in contact with air.
         */
        getContactXOrigin: function() {
            return -this.model.get('plateWidth') / 2;
        },

        /**
         * Gets the width of the portion of the plate that is in contact with air.
         */
        getContactWidth: function() {
            return Math.min(this.model.get('dielectricOffset'), this.model.get('plateWidth'));
        }

    });

    return AirPlateChargeView;
});