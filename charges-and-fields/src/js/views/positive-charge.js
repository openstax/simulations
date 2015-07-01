define(function(require) {

    'use strict';

    var ReservoirObjectView = require('views/reservoir-object');

    var Constants = require('constants');

    /**
     * 
     */
    var PositiveChargeView = ReservoirObjectView.extend({

        initialize: function(options) {
            options = _.extend({
                radius: 11,

                fillColor: '#ff3029',
                fillAlpha: 1,
                outlineColor: '#b31e18',
                outlineWidth: 2,
                outlineAlpha: 1,

                labelText: '+'
            }, options);

            ReservoirObjectView.prototype.initialize.apply(this, [options]);
        }

    });

    return PositiveChargeView;
});