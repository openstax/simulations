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
                outlineColor: '#CF2019',
                outlineWidth: 2,
                outlineAlpha: 1
            }, options);

            ReservoirObjectView.prototype.initialize.apply(this, [options]);
        },

        drawIcon: function(graphics, iconWidth) {
            graphics.moveTo(-iconWidth / 2, 0);
            graphics.lineTo( iconWidth / 2, 0);
            graphics.moveTo(0, -iconWidth / 2);
            graphics.lineTo(0,  iconWidth / 2);
        }

    });

    return PositiveChargeView;
});