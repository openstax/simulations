define(function (require) {

    'use strict';

    var RandomUtils = {

        /**
         * Gets a random value >= min and < max.
         */
        randomInRange: function(min, max) {
            return min + (Math.random() * (max - min));
        },
        
        /**
         * Gets a random boolean.
         */
        randomBoolean: function() {
            return (Math.random() < 0.5);
        },
        
        /**
         * Gets a random sign.
         * 
         * @return +1 or -1
         */
        randomSign: function() {
            return (this.randomBoolean() ? +1 : -1);
        },
        
        /**
         * Gets a random angle >= 0 and < 2 * PI.
         * 
         * @return angle, in radians
         */
        randomAngle: function() {
            return this.randomInRange(0, 2 * Math.PI);
        }

    };

    return RandomUtils;
});