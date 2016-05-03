define(function (require) {

    'use strict';

    var _ = require('underscore');

    var DatableItem = require('radioactive-dating-game/models/datable-item');

    var Constants = require('constants');

    /**
     * This class extends the datable item class to add animation and other time-driven behaviors.
     */
    var AnimatedDatableItem = DatableItem.extend({

        defaults: _.extend({}, DatableItem.prototype.defaults, {
            closureState: Constants.AnimatedDatableItem.CLOSURE_NOT_POSSIBLE,
            timeConversionFactor: 1
        }),

        initialize: function(attributes, options) {
            DatableItem.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:closureState', this.closureStateChanged);
        },

        getRadiometricAge: function() {
            if (this.get('closureState') !== AnimatedDatableItem.CLOSED) {
                // Radiometric aging does not begin until closure occurs.
                return 0;
            }
            else {
                // Calculate the time since closure occurred, since radiometrically
                //   speaking, that is our age.

                if (this.age < this.closureAge)
                    throw 'Age is less than closure age.';
                
                return this.age - this.closureAge;
            }
        },

        /**
         * Get the total age of this item, as opposed to the radiometric age.
         */
        getTotalAge: function() {
            return this.age;
        },

        /**
         * Force radiometric closure to occur.
         */
        forceClosure: function() {
            this.set('closureState', AnimatedDatableItem.CLOSED);
        },

        /**
         * Update the age
         */
        update: function(time, deltaTime) {
            this.age += deltaTime * this.get('timeConversionFactor');

            this.animate(this.age, deltaTime * this.get('timeConversionFactor'));
        },

        animate: function(age, deltaTime) {},

        closureStateChanged: function(model, closureState) {
            if (closureState === AnimatedDatableItem.CLOSED) {
                // Record the time at which closure occurred.
                this.closureAge = this.age;
            }
        }

    }, Constants.AnimatedDatableItem);

    return AnimatedDatableItem;
});
