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
                outlineColor: '#0047c2',
                outlineWidth: 2,
                outlineAlpha: 1,

                labelText: '-'
            }, options);

            ReservoirObjectView.prototype.initialize.apply(this, [options]);
        }

    });

    return NegativeChargeView;
});