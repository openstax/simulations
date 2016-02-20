define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2      = require('common/math/vector2');
    var MotionObject = require('common/models/motion-object');

    /**
     * A particle that moves according to the Verlet method
     */
    var Particle = MotionObject.extend({

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            this.prevAcceleration = new Vector2(this.get('acceleration'));
        },

        /**
         * Determines the new state of the body using the Verlet method
         */
        update: function(deltaTime) {
            // New position
            var xNew = this.getX()
                + deltaTime * this.get('velocity').x
                + deltaTime * deltaTime * this.get('acceleration').x / 2;
            var yNew = this.getY()
                + deltaTime * this.get('velocity').y
                + deltaTime * deltaTime * this.get('acceleration').y / 2;
            this.setPosition(xNew, yNew);

            // New velocity
            var vxNew = this.get('velocity').x + deltaTime * (this.get('acceleration').x + this.prevAcceleration.x) / 2;
            var vyNew = this.get('velocity').y + deltaTime * (this.get('acceleration').y + this.prevAcceleration.y) / 2;
            this.setVelocity(vxNew, vyNew);

            // New acceleration
            this.prevAcceleration.set(this.get('acceleration'));
        },

        /**
         * Function that facilitates setting the acceleration vector 
         *   while still triggering a change event.
         */
        setAcceleration: function(x, y, options) {
            this.prevAcceleration.set(this.get('acceleration'));

            MotionObject.prototype.setAcceleration.apply(this, arguments);
        },

        getSpeed: function() {
            return this.get('velocity').length();
        }

    });

    return Particle;
});