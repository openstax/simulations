define(function(require) {

    'use strict';

    var ReservoirObjectView = require('views/reservoir-object');

    var Constants = require('constants');

    /**
     * 
     */
    var NegativeChargeView = ReservoirObjectView.extend({

        initialize: function(options) {
            options = _.extend({
                radius: 11,

                fillColor: '#0060FF',
                fillAlpha: 1,
                outlineColor: '#004FD8',
                outlineWidth: 2,
                outlineAlpha: 1,

                labelText: '-' // Note that this character is a dash, not a hyphen
            }, options);

            ReservoirObjectView.prototype.initialize.apply(this, [options]);
        }

    });

    return NegativeChargeView;
});