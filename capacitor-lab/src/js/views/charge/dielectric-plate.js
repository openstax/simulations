define(function(require) {

    'use strict';

    var PlateChargeView = require('views/charge/plate');

    /**
     * Portion of the plate charge due to the air. Charges appear on the
     *   portion of the plate that is in contact with air (not in contact
     *   with the dielectric.)
     */
    var DielectricPlateChargeView = PlateChargeView.extend({

        /**
         * Gets the portion of the plate charge due to the dielectric.
         */
        getPlateCharge: function() {
            return this.model.getDielectricPlateCharge();
        },

        /**
         * Gets the x offset (relative to the plate's origin) of the portion
         *   of the plate that is in contact with the dielectric.
         */
        getContactXOrigin: function() {
            return -(this.model.get('plateWidth') / 2) + this.model.get('dielectricOffset');
        },

        /**
         * Gets the width of the portion of the plate that is in contact with
         *   the dielectric.
         */
        getContactWidth: function() {
            return Math.max(0, this.model.get('plateWidth') - this.model.get('dielectricOffset'));
        }

    });

    return DielectricPlateChargeView;
});