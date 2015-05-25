define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Rectangle = require('common/math/rectangle');

    var Body = require('models/body');

    /**
     * Model representation of a cloud in an atmosphere.
     */
    var Cloud = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            bounds: null
        }),

        initialize: function(attributes, options) {
            Body.prototype.initialize.apply(this, [attributes, options]);

            this.set('bounds', new Rectangle(this.get('bounds')));
            this.setPosition(this.getCenterOfMass().x, this.getCenterOfMass().y);
        },

        /**
         * Returns center of mass of the cloud.
         */
        getCenterOfMass: function() {
            return this.get('bounds').center();
        },

        /**
         * Returns the moment of inertia.
         */
        getMomentOfInertia: function() {
            return Number.MAX_VALUE;
        },

        /**
         * Returns the width of the cloud.
         */
        width: function() {
            return this.get('bounds').w;
        },

        /**
         * Returns the height of the cloud.
         */
        height: function() {
            return this.get('bounds').h;
        }

    });

    return Cloud;
});