define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var VanillaBody = require('./body-vanilla');

    /**
     * A spherical body with mass and momentum
     */
    var VanillaSphericalBody = VanillaBody.extend({

        collidable: true,

        defaults: _.extend({}, VanillaBody.prototype.defaults, {
            radius: 0
        }),

        init: function() {
            VanillaBody.prototype.init.apply(this, arguments);

            this.prevPosition = new Vector2();
            this.prevVelocity = new Vector2();
        },

        onCreate: function(attributes, options) {
            VanillaBody.prototype.onCreate.apply(this, [attributes, options]);

            this.prevPosition.set(this.get('position'));
            this.prevVelocity.set(this.get('velocity'));
        },

        getCM: function() {
            return this.get('position');
        },

        getMomentOfInertia: function() {
            return this.get('mass') * this.get('radius') * this.get('radius') * 2 / 5;
        },

        getCenter: function() {
            return this.get('position');
        },

        /**
         * Overrides setPosition function to keep track of the previous position
         */
        setPosition: function(x, y, options) {
            this.prevPosition.set(this.get('position'));

            VanillaBody.prototype.setPosition.apply(this, arguments);
        },

        /**
         * Overrides setVelocity function to keep track of the previous velocity
         */
        setVelocity: function(x, y, options) {
            this.prevVelocity.set(this.get('velocity'));

            VanillaBody.prototype.setVelocity.apply(this, arguments);
        },

        getPreviousPosition: function() {
            return this.prevPosition;
        },

        getPreviousVelocity: function() {
            return this.prevVelocity;
        }

    });

    return VanillaSphericalBody;
});