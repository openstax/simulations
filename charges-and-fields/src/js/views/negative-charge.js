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
                outlineAlpha: 1
            }, options);

            ReservoirObjectView.prototype.initialize.apply(this, [options]);
        },

        drawIcon: function(graphics, iconWidth) {
            graphics.moveTo(-iconWidth / 2, 0);
            graphics.lineTo( iconWidth / 2, 0);
        }

    });

    return NegativeChargeView;
});