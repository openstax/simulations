define(function (require) {

    'use strict';

    var PositionableObject = require('common/models/positionable-object');

    var NucleusType  = require('models/nucleus-type');
    var HalfLifeInfo = require('models/half-life-info');

    var DatableItem = require('radioactive-dating-game/models/datable-item');

    var Constants = require('constants');

    /**
     * This is a meter that supplies information about the amount of a radiometric
     *   substance that has decayed in a given sample.
     */
    var RadiometricDatingMeter = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            rotation: 0, // Radians
            nucleusType: NucleusType.CARBON_14,
            measurementMode: Constants.RadiometricDatingMeter.OBJECTS,
            itemBeingTouched: null,
            halfLifeOfCustomNucleus: Constants.DEFAULT_CUSTOM_NUCLEUS_HALF_LIFE
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, [attributes, options]);
        },

        rotate: function(rotationDelta) {
            this.set('rotation', this.get('rotation') + rotationDelta);
        },

        /**
         * Get the percentage of the element that is being used for radiometric
         *   dating that remains in the currently touched item.  If no item is
         *   being touched, this returns NaN (not a number).
         */
        getPercentageOfDatingElementRemaining: function() {
            if (!this.get('itemBeingTouched'))
                return NaN;
            
            var halflife;
            
            if (this.get('nucleusType') === NucleusType.HEAVY_CUSTOM)
                halflife = this.get('halfLifeOfCustomNucleus');
            else
                halflife = HalfLifeInfo.getHalfLifeForNucleusType(this.get('nucleusType'));
            
            if (this.get('itemBeingTouched').isOrganic() && this.get('nucleusType') === NucleusType.URANIUM_238) {
                // For the purposes of this sim, organic materials do not contain
                //   any U238, nor matter how old they are.
                return 0;
            }
            
            if (!this.get('itemBeingTouched').isOrganic() && this.get('nucleusType') === NucleusType.CARBON_14) {
                // For the purposes of this sim, inorganic materials do not
                //   contain any Carbon 14.
                return 0;
            }
            
            if (this.get('itemBeingTouched').getRadiometricAge() <= 0) {
                return 100;
            }
            else {
                // Calculate the percentage based on the standard exponential
                //   decay curve.
                return 100 * Math.exp(-0.693 * this.get('itemBeingTouched').getRadiometricAge() / halflife);
            }
        },

        determineItemBeingTouched: function(items) {
            if (this.get('measurementMode') === RadiometricDatingMeter.OBJECTS) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].contains(this.get('position'))) {
                        this.set('itemBeingTouched', items[i]);
                        return;
                    }
                }
                this.set('itemBeingTouched', null);    
            }
            else {
                this.set('itemBeingTouched', DatableItem.DATABLE_AIR);
            }
        }

    }, Constants.RadiometricDatingMeter);

    return RadiometricDatingMeter;
});
