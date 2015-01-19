define(function (require) {

    'use strict';

    /**
     * A function that takes a range object in the format
     *   { min: <number>, max: <number> } and adds helper
     *   functions to it that perform common tasks related
     *   to ranges.
     */
    var range = function(rangeObject) {
        rangeObject.random = function() {
            return (this.max - this.min) * Math.random() + this.min;
        };

        rangeObject.lerp = function(percent) {
            return this.length() * percent + this.min;
        };

        rangeObject.contains = function(x) {
            return x <= this.max && x >= this.min;
        };

        rangeObject.length = function() {
            return this.max - this.min;
        };

        rangeObject.center = function() {
            return this.min + (this.length() / 2);
        };

        return rangeObject;
    };

    return range;

});