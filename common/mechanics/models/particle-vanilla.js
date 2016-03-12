define(function (require) {

    'use strict';

    var Vector2             = require('../math/vector2');
    var VanillaMotionObject = require('../models/motion-object-vanilla');

    /**
     * A particle that moves according to the Verlet method
     */
    var VanillaParticle = VanillaMotionObject.extend({

        init: function() {
            VanillaMotionObject.prototype.init.apply(this, arguments);

            this.prevAcceleration = new Vector2();
        },

        onCreate: function(attributes, options) {
            VanillaMotionObject.prototype.onCreate.apply(this, [attributes, options]);

            this.prevAcceleration.set(this.get('acceleration'));
        },

        /**
         * Determines the new state of the body using the Verlet method
         */
        update: function(time, deltaTime) {
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

            VanillaMotionObject.prototype.setAcceleration.apply(this, arguments);
        },

        getSpeed: function() {
            return this.get('velocity').length();
        }

    });

    return VanillaParticle;
});