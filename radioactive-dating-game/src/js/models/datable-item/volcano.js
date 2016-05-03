define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AnimatedDatableItem = require('radioactive-dating-game/models/datable-item/animated');

    var Constants = require('constants');

    /**
     * This class implements the behavior of a model element that represents a
     *   volcano that can can be dated by radiometric means, and that can erupt,
     *   and that sends out the appropriate animation notifications when it does.
     */
    var Volcano = AnimatedDatableItem.extend({

        defaults: _.extend({}, AnimatedDatableItem.prototype.defaults, {
            isOrganic: false
        }),

        initialize: function(attributes, options) {
            AnimatedDatableItem.prototype.initialize.apply(this, [attributes, options]);


        },

        /**
         * The volcano is a little unique in that it has a radiometric age before
         * it does anything, which then gets reset to zero while erupting, and
         * then it starts to age again.
         */
        getRadiometricAge: function() {
            var radiometricAge;
            
            if (this.get('closureState') === Volcano.CLOSURE_NOT_POSSIBLE) {
                // This means that the eruption hasn't started, so show the per-eruption age.
                radiometricAge = Volcano.PRE_ERUPTION_INITIAL_AGE + this.getTotalAge();
            }
            else if (this.get('closureState') === Volcano.CLOSURE_POSSIBLE) {
                // This indicates that the volcano is erupting, so the radiometric age is 0.
                radiometricAge = 0;
            }
            else {
                // Done erupting.  The base class implementation is now relevant.
                radiometricAge = AnimatedDatableItem.prototype.getRadiometricAge.apply(this, arguments);
            }
            
            return radiometricAge;
        }
        
    }, Constants.Volcano);

    return Volcano;
});
