define(function(require) {

    'use strict';

    var ReservoirObjectView = require('views/reservoir-object');

    var Constants = require('constants');

    /**
     * 
     */
    var SensorView = ReservoirObjectView.extend({

        initialize: function(options) {
            options = _.extend({
                radius: 9
            }, options);

            ReservoirObjectView.prototype.initialize.apply(this, [options]);
        }

    });

    return SensorView;
});