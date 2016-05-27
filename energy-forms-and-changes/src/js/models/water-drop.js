define(function (require) {

    'use strict';

    var Vector2                   = require('common/math/vector2');
    var VanillaPositionableObject = require('common/models/positionable-object-vanilla');

    var Constants = require('constants');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var WaterDrop = VanillaPositionableObject.extend({

        defaults: {
            width: 1,
            height: 1
        },
        
        init: function() {
            VanillaPositionableObject.prototype.init.apply(this, arguments);

            this.velocity = new Vector2();
            this.acceleration = new Vector2();
            this.translation = new Vector2();
        },

        /**
         * Called on the instance after 'create' is called to set initial values
         */
        onCreate: function(attributes, options) {
            VanillaPositionableObject.prototype.onCreate.apply(this, [attributes, options]);

            this.velocity.set(0, 0);
            this.acceleration.set(0, 0);
            this.translation.set(0, 0);
        },

        update: function(time, deltaTime) {
            // Determine interpolated acceleration
            this.acceleration.set(WaterDrop.ACCELERATION_DUE_TO_GRAVITY).scale(deltaTime);

            // Update velocity from the interpolated acceleration
            this.velocity.add(this.acceleration);

            // Get the translation from velocity and deltaTime
            this.translation.set(this.velocity).scale(deltaTime);

            // Translate the water droplet
            this.translate(this.translation);

            // Remove drops that have gone out of view
            return (this.get('position').length() > WaterDrop.MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER);
        },

    }, Constants.WaterDrop);

    return WaterDrop;
});
