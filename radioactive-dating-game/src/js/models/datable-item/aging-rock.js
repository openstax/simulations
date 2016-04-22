define(function (require) {

    'use strict';

    var _ = require('underscore');

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

            // Set animation parameters
            this.initAnimationParameters();
        },

        initAnimationParameters: function() {
            this._flyCounter = AgingRock.FLY_COUNT;
            // Calculate the x translation per step that will get us through our desired
            //   flight path and to our desired final destination
            this._flightDxPerStep = (AgingRock.FINAL_X - this.getX()) / AgingRock.FLY_COUNT;
            // Save the initial y
            this._initialY = this.getY();
            // Distance from top of arc to final y
            this._totalArcHeight = AgingRock.FIRST_PART_ARC_HEIGHT - (AgingRock.FINAL_Y - this.getY()); 
            // Calculate the amount of growth needed per step in order to reach
            //   the right size by the end of the flight.
            this._growthPerStep = Math.pow(AgingRock.FINAL_ROCK_WIDTH / this.get('width'), 1 / AgingRock.FLY_COUNT);
            this._coolingStartPauseCounter = AgingRock.COOLING_START_PAUSE_STEPS;
            this._coolingCounter = AgingRock.COOLING_STEPS;
            this._closurePossibleSent = false;
            this._closureOccurredSent = false;
            this._falling = false;

            this.initParabolicEquation();
        },

        initParabolicEquation: function() {
            var k = this._totalArcHeight;
            var yIntercept = this._initialY - AgingRock.FINAL_Y;
            var initialH = AgingRock.FIRST_PART_ARC_TIME;
            // Solve for 'a' when x = 0 (when x = 0, y is the y-intercept)
            var initialA = (yIntercept - k) / Math.pow(0 - initialH, 2);

            // Find approximate 'a' and 'h' values by guess-and-check
            var aWindowHalf = Math.abs(initialA * 0.1);
            var hWindowHalf = 0.1;
            var aStep = (aWindowHalf * 2) / 40;
            var hStep = (hWindowHalf * 2) / 40;
            var yEpsilon = 10;
            var foundApproximation = false;

            for (var a = initialA - aWindowHalf; a <= initialA + aWindowHalf && !foundApproximation; a += aStep) {
                for (var h = initialH - hWindowHalf; h <= initialH + hWindowHalf && !foundApproximation; h += hStep) {
                    // Check to see if these values give a good y-intercept and x intercept at x=1
                    if (yEpsilon >= Math.abs(0          - this.getYFromEquation(1, h, k, a)) &&
                        yEpsilon >= Math.abs(yIntercept - this.getYFromEquation(0, h, k, a))
                    ) {
                        this._a = a;
                        this._h = h;
                        foundApproximation = true;
                    }
                }
            }

            // If we didn't find good approximate values, just use our initial values
            if (this._a === undefined) {
                this._a = initialA;
                this._h = initialH;
            }

            this._k = k;
        },

        animate: function(age, deltaTime) {
            if (this._flyCounter > 0) {
                // Move along the arc
                var dx = this._flightDxPerStep;
                var y = this.getYFromStep(AgingRock.FLY_COUNT - this._flyCounter);
                var dy = y - this.getY();
                this.setPosition(this.getX() + dx, y);
                // console.log(this.get('position'))
                // Grow
                this.set('width',  this.get('width')  * this._growthPerStep);
                this.set('height', this.get('height') * this._growthPerStep);
                
                // Rotate
                this.rotate(AgingRock.ROTATION_PER_STEP);
                
                // Move to the next step
                this._flyCounter--;

                // Trigger an event if it's starting its decent so we can change layers in the view
                if (!this._falling && dy < 0) {
                    this._falling = true;
                    this.trigger('falling');
                }
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

        /**
         * Get y when y = a(x - h)^2 + k
         */
        getYFromEquation: function(x, h, k, a) {
            // This is a parabolic equation where x represents the time as a proportion
            //   of the current step vs the total number of steps in the animation and
            //   where x = 1 finds us at the resting y value, which is zero.  
            var y = a * Math.pow(x - h, 2) + k;
            return y;
        },

        getYFromStep: function(step) {
            var a = this._a;
            var h = this._h;
            var k = this._k;
            var x = step / AgingRock.FLY_COUNT;
            var y = this.getYFromEquation(x, h, k, a);

            // The zero returned by the equation is actually the offset from the final y
            //   position, so we need to add it to the final y to get the real position.
            return AgingRock.FINAL_Y + y;
        }

    }, Constants.AgingRock);

    return AgingRock;
});
