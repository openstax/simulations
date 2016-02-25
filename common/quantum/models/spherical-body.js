define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Body = require('./body');

    /**
     * A spherical body with mass and momentum
     */
    var SphericalBody = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            radius: 0
        }),

        initialize: function(attributes, options) {
            Body.prototype.initialize.apply(this, [attributes, options]);

            this.prevPosition = new Vector2(this.get('position'));
            this.prevVelocity = new Vector2(this.get('velocity'));
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
            this.prevPosition.set(this.get('acceleration'));

            Particle.prototype.setPosition.apply(this, arguments);
        },

        /**
         * Overrides setVelocity function to keep track of the previous velocity
         */
        setVelocity: function(x, y, options) {
            this.prevVelocity.set(this.get('acceleration'));

            Particle.prototype.setVelocity.apply(this, arguments);
        },

        getPreviousPosition: function() {
            return this.prevPosition;
        },

        getPreviousVelocity: function() {
            return this.prevVelocity;
        }

    });

    return SphericalBody;
});