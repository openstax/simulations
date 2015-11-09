define(function (require) {

    'use strict';

    var _ = require('underscore');

    var FaradayObject = require('models/faraday-object');

    /**
     * 
     */
    var AbstractCurrentSource = FaradayObject.extend({

        defaults: _.extend({}, FaradayObject.prototype.defaults, {
            maxVoltage: Number.POSITIVE_INFINITY,
            amplitude: 1 // Full strength
        }),

        /**
         * Gets the voltage.
         */
        getVoltage: function() {
            return this.get('amplitude') * this.get('maxVoltage');
        }

    });

    return AbstractCurrentSource;
});
