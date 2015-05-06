define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Filter = require('models/filter');

    /**
     * 
     */
    var BandpassFilter = function(low, high) {
        Filter.apply(this, arguments);

        this.low  = low;
        this.high = high;
    };

    /**
     * Instance functions/properties
     */
    _.extend(BandpassFilter.prototype, Filter.prototype, {

        /**
         * Returns whether or not a certain value passes
         *   through the filter.
         */
        passes: function(value) {
            return value >= this.low && value <= this.high;
        }

    });

    return BandpassFilter;
});
