define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Body = require('./body');

    /**
     * A spherical body with mass and momentum
     */
    var Wall = Body.extend({

        collidable: true,

        defaults: _.extend({}, Body.prototype.defaults, {
            bounds: null
        }),

        initialize: function(attributes, options) {
            Body.prototype.initialize.apply(this, [attributes, options]);

            this.set('bounds', new Rectangle(this.get('bounds')));

            this._centerOfMass = new Vector2();
        },

        getCM: function() {
            return this._centerOfMass.set(
                this.get('bounds').left()   + this.get('bounds').w / 2,
                this.get('bounds').bottom() + this.get('bounds').h / 2
            );
        },

        getMomentOfInertia: function() {
            return Number.POSITIVE_INFINITY;
        },

        getBounds: function() {
            return this.get('bounds');
        },

        getPreviousPosition: function() {
            return null;
        },

        getPreviousVelocity: function() {
            return this.get('velocity');
        }

    });

    return Wall;
});