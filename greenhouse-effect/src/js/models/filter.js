define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * 
     */
    var Filter = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(Filter.prototype, {

        /**
         * Returns whether or not a certain value passes
         *   through the filter.
         */
        passes: function(value) {},

        /**
         * Returns whether or not a certain value gets absorbed
         *   by the filter
         */
        absorbs: function(value) {
            return !this.passes(value);
        }

    });

    return Filter;
});
