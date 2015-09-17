define(function (require) {

    'use strict';

    /**
     * Returns a number that is as close to the given value while still
     *   being within the given range.
     */
    var clamp = function(min, value, max) {
        return Math.max(min, Math.min(value, max));
    };

    return clamp;
});
