define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');
    var Vector2      = require('common/math/vector2');

    var Constants = require('constants');

    var Body = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            alpha: 0,
            omega: 0,
            mass:  0,
            charge: 0,

            lastCollidedBody: null
        }),

        /**
         * Determines the new state of the body using the Verlet method
         */
        update: function(deltaTime) {
            this.updatePositionFromAcceleration(deltaTime);
        },

        /**
         * Calculates and returns center of mass.
         */
        getCenterOfMass: function() {},

        /**
         * Calculates and returns the moment of inertia.
         */
        getMomentOfInertia: function() {},

        /**
         * Calculates and returns the body's kinetic energy.
         */
        getKineticEnergy: function() {
            return 
                (this.get('mass') * this.get('velocity').lengthSq() / 2) + 
                (this.getMomentOfInertia() * this.get('omega') * this.get('omega') / 2);
        }

    });

    return Body;
});
