define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AnimatedDatableItem = require('radioactive-dating-game/models/datable-item/animated');

    var Constants = require('constants');

    // Whether or not this is the first time creating one of these objects--used
    //   to determine whether we should roll to see if we're going to show an
    //   Easter egg.
    var firstTimeCreating = true;

    /**
     * This class extends the datable item class to add animation and other time-driven behaviors.
     */
    var FlyingRock = AnimatedDatableItem.extend({

        defaults: _.extend({}, AnimatedDatableItem.prototype.defaults, {
            isOrganic: false,
            isMovingMan: false
        }),

        initialize: function(attributes, options) {
            AnimatedDatableItem.prototype.initialize.apply(this, [attributes, options]);

            // Optionally make this rock the moving man
            if (firstTimeCreating && Math.random() > 0.95)
                this.set('isMovingMan', true);
            firstTimeCreating = false;

            // Determine the flight path parameters
            this.stepTimer = 0;
            this.currentFlightStep = 0;
            this.rotationPerStep = (Math.random() - 0.5) * FlyingRock.MAX_ROTATION_CHANGE;
            this.arcHeightControl = FlyingRock.ARC_HEIGHT_INCREMENT_RANGE.random();
            this.flightXTranslation = (Math.random() - 0.5) * 2 * FlyingRock.MAX_X_TRANSLATION_INCREMENT;
        },

        animate: function(age, deltaTime) {
            this.stepTimer += deltaTime;
            while (this.stepTimer >= FlyingRock.FLIGHT_STEP_INTERVAL) {
                this.stepTimer -= FlyingRock.FLIGHT_STEP_INTERVAL;
                this.currentFlightStep++;

                if (this.currentFlightStep < FlyingRock.NUM_FLIGHT_STEPS) {
                    var flightYTranslation = this.arcHeightControl * ((FlyingRock.NUM_FLIGHT_STEPS * 0.42) - this.currentFlightStep);
                    this.translate(this.flightXTranslation, flightYTranslation);
                    this.rotate(this.rotationPerStep)
                }
                else {
                    // It's done with its flight and is way off screen, so it can be destroyed.
                    this.destroy();
                }
            }
        },

    }, Constants.FlyingRock);

    return FlyingRock;
});
