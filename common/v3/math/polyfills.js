define(function (require) {

    'use strict';

    /**
     * From http://stackoverflow.com/questions/7624920/number-sign-in-javascript
     *
     * I also ran the jsperf on it, and this is surprisingly by far the fastest
     *   for the current version of Chrome.
     */
    Math.sign = function(x) {
        return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
    };

});