define(function (require) {

    'use strict';

    var Rectangle = require('common/math/rectangle');
    var Vector2   = require('common/math/vector2');

    var AnimatedDatableItem = require('radioactive-dating-game/models/datable-item/animated');

    var Constants = require('constants');

    /**
     * This class implements the behavior of a model element that represents a
     * rock that can be dated by radiometric means, and that starts off looking
     * hot and then cools down.
     */
    var AgingRock = AnimatedDatableItem.extend({

        defaults: _.extend({}, AnimatedDatableItem.prototype.defaults, {
            isOrganic: false,
            cooledPercent: 0
        }),

        initialize: function(attributes, options) {
            AnimatedDatableItem.prototype.initialize.apply(this, [attributes, options]);

            this.startingAttributes = this.toJSON();

            // Set animation parameters
            this.initAnimationParameters();
        },

        initAnimationParameters: function() {
            this._flyCounter = AgingRock.FLY_COUNT;
            // Calculate the amount of growth needed per step in order to reach
            //   the right size by the end of the flight.
            this._growthPerStep = Math.pow(AgingRock.FINAL_ROCK_WIDTH / width, 1 / AgingRock.FLY_COUNT);
            this._coolingStartPauseCounter = AgingRock.COOLING_START_PAUSE_STEPS;
            this._coolingCounter = AgingRock.COOLING_STEPS;
            this._closurePossibleSent = false;
            this._closureOccurredSent = false;
        },

        reset: function() {
            this.set(this.startingAttributes);
            this.age = this.get('age');
            this.initAnimationParameters();
        },

        animate: function(age, deltaTime) {
            if (this._flyCounter > 0) {
                // Move along the arc
                var flightXTranslation = AgingRock.FINAL_X_TRANSLATION / AgingRock.FLY_COUNT;
                var flightYTranslation = (this._flyCounter - (AgingRock.FLY_COUNT * 0.58)) * AgingRock.ARC_HEIGHT_FACTOR;
                this.translate(flightXTranslation, flightYTranslation);
                
                // Grow
                this.set('width',  this.get('width')  * this._growthPerStep);
                this.set('height', this.get('height') * this._growthPerStep);
                
                // Rotate
                this.rotate(AgingRock.ROTATION_PER_STEP);
                
                // Move to the next step
                this._flyCounter--;
            }
            else if (this._flyCounter <= 0 && !this._closurePossibleSent) {
                // The rock has landed, so it is now possible to force closure if desired.
                this.set('closureState', AgingRock.CLOSURE_POSSIBLE);
                this._closurePossibleSent = true;
            }
            else if (this._coolingStartPauseCounter > 0) {
                // Wait for it...
                if (this.get('closureState') !== AgingRock.CLOSED) {
                    this._coolingStartPauseCounter--;
                }
                else {
                    // Closure has been forced externally - skip the rest of this stage.
                    this._coolingStartPauseCounter = 0;
                    this._closureOccurredSent = true;
                }
            }
            else if (this._coolingCounter > 0) {
                // Cool it
                if (this.get('closureState') !== AgingRock.CLOSED) {
                    this.set('cooledPercent', Math.min(this.get('cooledPercent') + (1 / AgingRock.COOLING_STEPS), 1));
                    this._coolingCounter--;
                }
                else {
                    // Closure has been forced externally - skip the rest of this stage.
                    this.set('cooledPercent', 1);
                    this._coolingCounter = 0;
                    this._closureOccurredSent = true;
                }
            }
            else if (!this._closureOccurredSent) {
                // The rock has finished cooling, so closure occurs and the rock begins
                //   radiometrically aging.
                this.set('closureState', AgingRock.CLOSED);
                this._closureOccurredSent = true;
            }
        },

    }, Constants.AgingRock);

    return AgingRock;
});
