define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');
    var Vector2      = require('common/math/vector2');

    var Carbon14Nucleus   = require('models/nucleus/carbon-14');
    var Uranium238Nucleus = require('models/nucleus/uranium-238');

    var Constants = require('constants');

    /**
     * This class represents a physical object that can be dated using radiometric
     *   measurements, such as a skull or a fossil or a tree.
     */
    var DatableItem = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            name: 'Object',
            age: 0,

            width: 0,
            height: 0,
            rotation: 0, // Radians

            isOrganic: false
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            this.age = this.get('age');
            this.startingAttributes = this.toJSON();

            this._bounds = new Rectangle();
            this._vector = new Vector2();
        },

        reset: function() {
            this.set(this.startingAttributes);
            this.age = this.get('age');
        },

        rotate: function(rotationDelta) {
            this.set('rotation', this.get('rotation') + rotationDelta);
        },

        /**
         * Get the radiometric age of the item in milliseconds.  This is the age
         *   since the "closure" occurred, which for an organic item means when it
         *   died and for a mineral, since it stopped chemically interacting with
         *   its environment.
         */
        getRadiometricAge: function() {
            return this.age;
        },

        getBounds: function() {
            return this._bounds.set(
                this.getX() - this.get('width') / 2,
                this.getY() - this.get('height') / 2,
                this.get('width'),
                this.get('height')
            );
        },

        getRelativeBounds: function() {
            return this._bounds.set(
                -this.get('width') / 2,
                -this.get('height') / 2,
                this.get('width'),
                this.get('height')
            );
        },

        contains: function(point) {
            // We can't rotate the rectangle, so what we'll do is rotate the world
            //   around it, and that will achieve the same end.

            // Get the vector relative to the center of this item and then perform
            //   the inverse of the rotation transform
            var rotatedRelativePoint = this._vector
                .set(point)
                .sub(this.get('position'))
                .rotate(-this.get('rotation'));

            var relativeBounds = this.getRelativeBounds();

            return relativeBounds.contains(rotatedRelativePoint);
        },

        isOrganic: function() {
            return this.get('isOrganic');
        }

    }, {

        /**
         * Get the amount of a substance that would be left based on the age of an
         *   item and the half life of the nucleus of the radiometric material
         *   being tested.
         *
         * @param item
         * @param customNucleusHalfLife
         * @return
         */
        getPercentageCustomNucleusRemaining: function(item, customNucleusHalfLife) {
            return DatableItem.calculatePercentageRemaining(item.getRadiometricAge(), customNucleusHalfLife);
        },

        getPercentageCarbon14Remaining: function(item) {
            return DatableItem.calculatePercentageRemaining(item.getRadiometricAge(), Carbon14Nucleus.HALF_LIFE);
        },

        getPercentageUranium238Remaining: function(item) {
            return DatableItem.calculatePercentageRemaining(item.getRadiometricAge(), Uranium238Nucleus.HALF_LIFE);
        },

        calculatePercentageRemaining: function(age, halfLife) {
            if (age <= 0)
                return 100;
            else
                return 100 * Math.exp(-0.693 * age / halfLife);
        }

    });


    DatableItem.DATABLE_AIR = new DatableItem({
        name: 'Datable Air', 
        width: 0, 
        rotation: 0, 
        age: 0, 
        isOrganic: true
    });


    return DatableItem;
});
