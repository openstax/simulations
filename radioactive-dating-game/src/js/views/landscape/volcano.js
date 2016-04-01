define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var LandscapeView = require('radioactive-dating-game/views/landscape');

    var Assets = require('assets');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var VolcanoLandscapeView = LandscapeView.extend({

        shakeDistance: 10, // Pixels
        shakeSpeed: 500,   // Pixels per second

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            this.shakeDirection = 1;

            LandscapeView.prototype.initialize.apply(this, arguments);
        },

        getBackgroundTexture: function() {
            return Assets.Texture(Assets.Images.MEASUREMENT_BACKGROUND_VOLCANO);
        },

        update: function(time, deltaTime, paused) {
            if (!paused) {
                this.background.x += deltaTime * this.shakeSpeed * this.shakeDirection;

                if (this.background.x <= this.width / 2 - this.shakeDistance / 2) {
                    this.background.x = this.width / 2 - this.shakeDistance / 2;
                    this.shakeDirection *= -1;
                }
                else if (this.background.x >= this.width / 2 + this.shakeDistance / 2) {
                    this.background.x = this.width / 2 + this.shakeDistance / 2;
                    this.shakeDirection *= -1;
                }
            }
        }

    });


    return VolcanoLandscapeView;
});